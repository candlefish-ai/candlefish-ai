"""MCP Server for FOGG Calendar tools"""

import asyncio
import json
from datetime import datetime
from typing import Any

from mcp import Server, Tool
from mcp.types import TextContent
from pydantic import BaseModel

from src.cadence import analyze_meeting_patterns, get_events_for_calendar
from src.calendar_manager import (
    create_recurring_event,
    share_calendar_with_group,
)
from src.introspect import list_all_calendars, list_group_members


class ListEventsArgs(BaseModel):
    """Arguments for list_events tool."""

    calendar_id: str
    days_back: int = 30
    days_forward: int = 30


class CreateEventArgs(BaseModel):
    """Arguments for create_event tool."""

    calendar_id: str
    summary: str
    description: str
    start_time: str  # ISO format
    duration_minutes: int
    attendee_emails: list[str] = []
    recurrence_rule: str = ""


class SyncGroupArgs(BaseModel):
    """Arguments for sync_group tool."""

    calendar_id: str
    group_email: str


class OptimizeCadenceArgs(BaseModel):
    """Arguments for optimize_cadence tool."""

    calendar_id: str
    months_to_analyze: int = 12


# Initialize MCP server
server = Server("fogg-calendar-server")


@server.list_tools()
async def list_tools() -> list[Tool]:
    """List available MCP tools."""
    return [
        Tool(
            name="list_calendars",
            description="List all accessible calendars",
            inputSchema={
                "type": "object",
                "properties": {},
            },
        ),
        Tool(
            name="list_events",
            description="List events from a calendar",
            inputSchema={
                "type": "object",
                "properties": {
                    "calendar_id": {"type": "string", "description": "Calendar ID"},
                    "days_back": {
                        "type": "integer",
                        "description": "Days to look back",
                        "default": 30,
                    },
                    "days_forward": {
                        "type": "integer",
                        "description": "Days to look forward",
                        "default": 30,
                    },
                },
                "required": ["calendar_id"],
            },
        ),
        Tool(
            name="create_event",
            description="Create a calendar event",
            inputSchema={
                "type": "object",
                "properties": {
                    "calendar_id": {"type": "string", "description": "Calendar ID"},
                    "summary": {"type": "string", "description": "Event title"},
                    "description": {"type": "string", "description": "Event description"},
                    "start_time": {
                        "type": "string",
                        "description": "Start time in ISO format",
                    },
                    "duration_minutes": {
                        "type": "integer",
                        "description": "Duration in minutes",
                    },
                    "attendee_emails": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of attendee emails",
                        "default": [],
                    },
                    "recurrence_rule": {
                        "type": "string",
                        "description": "RFC5545 recurrence rule",
                        "default": "",
                    },
                },
                "required": ["calendar_id", "summary", "start_time", "duration_minutes"],
            },
        ),
        Tool(
            name="sync_group",
            description="Sync calendar with Google Group members",
            inputSchema={
                "type": "object",
                "properties": {
                    "calendar_id": {"type": "string", "description": "Calendar ID"},
                    "group_email": {"type": "string", "description": "Google Group email"},
                },
                "required": ["calendar_id", "group_email"],
            },
        ),
        Tool(
            name="optimize_cadence",
            description="Analyze and optimize meeting cadence",
            inputSchema={
                "type": "object",
                "properties": {
                    "calendar_id": {"type": "string", "description": "Calendar ID"},
                    "months_to_analyze": {
                        "type": "integer",
                        "description": "Number of months to analyze",
                        "default": 12,
                    },
                },
                "required": ["calendar_id"],
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    """Handle tool calls."""
    try:
        if name == "list_calendars":
            calendars = await asyncio.to_thread(list_all_calendars)
            result = [
                {"id": cal.id, "name": cal.summary, "access_role": cal.access_role}
                for cal in calendars
            ]
            return [TextContent(type="text", text=json.dumps(result, indent=2))]

        elif name == "list_events":
            args = ListEventsArgs(**arguments)
            from datetime import timedelta

            time_min = datetime.utcnow() - timedelta(days=args.days_back)
            time_max = datetime.utcnow() + timedelta(days=args.days_forward)

            events = await asyncio.to_thread(
                get_events_for_calendar, args.calendar_id, time_min, time_max
            )

            result = [
                {
                    "id": event.id,
                    "summary": event.summary,
                    "start": event.start.isoformat(),
                    "end": event.end.isoformat(),
                    "attendee_count": len(event.attendees),
                }
                for event in events
            ]
            return [TextContent(type="text", text=json.dumps(result, indent=2))]

        elif name == "create_event":
            args = CreateEventArgs(**arguments)
            from dateutil import parser

            start_date = parser.parse(args.start_time)

            if args.recurrence_rule:
                event_id = await asyncio.to_thread(
                    create_recurring_event,
                    args.calendar_id,
                    args.summary,
                    args.description,
                    start_date,
                    args.duration_minutes,
                    args.attendee_emails,
                    args.recurrence_rule,
                )
            else:
                # For non-recurring events, we'd need to implement a separate function
                return [
                    TextContent(
                        type="text",
                        text=(
                            "Non-recurring events not yet implemented. "
                            "Please use recurrence_rule."
                        ),
                    )
                ]

            return [TextContent(type="text", text=f"Created event: {event_id}")]

        elif name == "sync_group":
            args = SyncGroupArgs(**arguments)

            # Share calendar with group
            success = await asyncio.to_thread(
                share_calendar_with_group, args.calendar_id, args.group_email
            )

            # Get group members
            members = await asyncio.to_thread(list_group_members, args.group_email)
            member_emails = [m.email for m in members]

            result = {
                "calendar_shared": success,
                "group_email": args.group_email,
                "member_count": len(member_emails),
                "members": member_emails,
            }
            return [TextContent(type="text", text=json.dumps(result, indent=2))]

        elif name == "optimize_cadence":
            args = OptimizeCadenceArgs(**arguments)
            from dateutil.relativedelta import relativedelta

            time_min = datetime.utcnow() - relativedelta(months=args.months_to_analyze)
            time_max = datetime.utcnow()

            events = await asyncio.to_thread(
                get_events_for_calendar, args.calendar_id, time_min, time_max
            )

            analysis = await asyncio.to_thread(analyze_meeting_patterns, events)

            result = {
                "total_events_analyzed": analysis.total_events,
                "average_attendance": f"{analysis.average_attendance:.1%}",
                "best_day": analysis.best_day,
                "best_time": analysis.best_time,
                "recommended_duration_minutes": analysis.recommended_duration_minutes,
                "attendance_by_day": {
                    day: f"{rate:.1%}" for day, rate in analysis.attendance_by_day.items()
                },
            }
            return [TextContent(type="text", text=json.dumps(result, indent=2))]

        else:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]

    except Exception as e:
        return [TextContent(type="text", text=f"Error: {e!s}")]


async def main():
    """Run the MCP server."""
    from mcp.server.stdio import stdio_server

    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream)


if __name__ == "__main__":
    asyncio.run(main())