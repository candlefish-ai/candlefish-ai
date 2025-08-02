"use client";

import React from "react";
import { animated, useTrail, config } from "@react-spring/web";
import { 
  InteractiveButton, 
  InteractiveInput, 
  InteractiveCheckbox,
  InteractiveRadio,
  InteractiveToggle,
  RippleEffect
} from "@/components/ui/MicroInteractions";
import {
  ValidationMessage,
  ValidatedField,
  ValidationSteps,
  SuccessOverlay,
  InlineValidation
} from "@/components/ui/FormValidationAnimations";
import { PerformanceOverlay } from "@/components/ui/PerformanceMonitor";
import { useSwipeNavigation, useLongPress, useDoubleTap } from "@/hooks/useTabletGestures";
import { usePrefersReducedMotion } from "@/lib/utils/accessibility";
import { Card } from "@/components/ui/card";

export default function AnimationsDemo() {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [isValidating, setIsValidating] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState("option1");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Demo sections animation
  const sections = [
    { title: "Micro Interactions", id: "micro" },
    { title: "Form Validation", id: "validation" },
    { title: "Touch Gestures", id: "gestures" },
    { title: "Performance", id: "performance" },
  ];

  const trail = useTrail(sections.length, {
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: prefersReducedMotion ? { duration: 0 } : config.gentle,
  });

  // Swipe navigation demo
  const [currentSection, setCurrentSection] = React.useState(0);
  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: () => setCurrentSection((prev) => Math.min(prev + 1, sections.length - 1)),
    onSwipeRight: () => setCurrentSection((prev) => Math.max(prev - 1, 0)),
  });

  // Long press demo
  const longPressHandlers = useLongPress(() => {
    alert("Long press detected!");
  });

  // Double tap demo
  const doubleTapHandlers = useDoubleTap(() => {
    setShowSuccess(true);
  });

  // Email validation
  const validateEmail = (value: string) => {
    setEmail(value);
    setEmailError("");
    
    if (value) {
      setIsValidating(true);
      setTimeout(() => {
        if (!value.includes("@")) {
          setEmailError("Please enter a valid email address");
        }
        setIsValidating(false);
      }, 1000);
    }
  };

  const validationSteps = [
    { label: "Basic Info", completed: true },
    { label: "Measurements", completed: true, current: true },
    { label: "Pricing", completed: false },
    { label: "Review", completed: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <PerformanceOverlay />
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Paintbox Animation Showcase
        </h1>

        <div className="grid gap-8">
          {trail.map((style, index) => {
            const section = sections[index];
            
            return (
              <animated.div key={section.id} style={style}>
                <Card className="p-8">
                  <h2 className="text-2xl font-semibold mb-6">{section.title}</h2>

                  {section.id === "micro" && (
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-4">
                        <InteractiveButton variant="primary">
                          Primary Button
                        </InteractiveButton>
                        <InteractiveButton variant="secondary">
                          Secondary Button
                        </InteractiveButton>
                        <InteractiveButton variant="ghost">
                          Ghost Button
                        </InteractiveButton>
                      </div>

                      <div className="grid gap-4 max-w-md">
                        <InteractiveInput
                          label="Email Address"
                          type="email"
                          value={email}
                          onChange={(e) => validateEmail(e.target.value)}
                          error={emailError}
                        />
                        
                        <div className="space-y-3">
                          <InteractiveCheckbox
                            label="I agree to the terms and conditions"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                          />
                          
                          <InteractiveToggle
                            label="Enable notifications"
                            checked={notifications}
                            onChange={(e) => setNotifications(e.target.checked)}
                          />
                        </div>

                        <div className="space-y-2">
                          <InteractiveRadio
                            name="options"
                            label="Option 1"
                            value="option1"
                            checked={selectedOption === "option1"}
                            onChange={() => setSelectedOption("option1")}
                          />
                          <InteractiveRadio
                            name="options"
                            label="Option 2"
                            value="option2"
                            checked={selectedOption === "option2"}
                            onChange={() => setSelectedOption("option2")}
                          />
                        </div>
                      </div>

                      <div className="relative inline-block">
                        <InteractiveButton variant="primary" size="lg">
                          Button with Ripple
                        </InteractiveButton>
                        <RippleEffect />
                      </div>
                    </div>
                  )}

                  {section.id === "validation" && (
                    <div className="space-y-6">
                      <ValidatedField
                        error={emailError}
                        validating={isValidating}
                        success={email.includes("@") && !emailError}
                      >
                        <input
                          type="email"
                          className="w-full p-3 outline-none"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => validateEmail(e.target.value)}
                        />
                      </ValidatedField>

                      <ValidationSteps steps={validationSteps} />

                      <div className="flex items-center gap-4">
                        <span>Validation status:</span>
                        <InlineValidation 
                          valid={email.includes("@") && !emailError} 
                          validating={isValidating}
                        />
                      </div>
                    </div>
                  )}

                  {section.id === "gestures" && (
                    <div className="space-y-6">
                      <div
                        className="bg-purple-100 p-8 rounded-lg text-center cursor-move"
                        {...swipeHandlers.bind()}
                      >
                        <animated.div style={swipeHandlers.spring}>
                          <p className="text-lg font-medium">
                            Swipe left or right to navigate sections
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            Current section: {currentSection + 1} / {sections.length}
                          </p>
                        </animated.div>
                      </div>

                      <div
                        className="bg-blue-100 p-8 rounded-lg text-center cursor-pointer"
                        {...longPressHandlers}
                      >
                        <p className="text-lg font-medium">
                          Long press this area
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Hold for 500ms to trigger action
                        </p>
                      </div>

                      <div
                        className="bg-green-100 p-8 rounded-lg text-center cursor-pointer"
                        {...doubleTapHandlers}
                      >
                        <p className="text-lg font-medium">
                          Double tap for success
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Tap twice quickly
                        </p>
                      </div>
                    </div>
                  )}

                  {section.id === "performance" && (
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Check the performance monitor in the bottom right corner.
                        All animations are optimized for 60fps on tablets.
                      </p>
                      <p className="text-gray-600">
                        Features:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>GPU-accelerated transforms</li>
                        <li>Adaptive quality based on device performance</li>
                        <li>Respects prefers-reduced-motion</li>
                        <li>Batched updates for complex animations</li>
                        <li>Optimized spring configurations</li>
                      </ul>
                      {prefersReducedMotion && (
                        <p className="text-amber-600 font-medium">
                          ⚠️ Reduced motion is enabled - animations are simplified
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              </animated.div>
            );
          })}
        </div>
      </div>

      <SuccessOverlay
        show={showSuccess}
        message="Double tap successful!"
        onComplete={() => setShowSuccess(false)}
      />
    </div>
  );
}