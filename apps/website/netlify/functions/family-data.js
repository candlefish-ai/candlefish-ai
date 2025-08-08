// Netlify Function: family-data
// Returns Shadow Credits and Trigger data after validating cf_family_auth cookie signature and expiry
const crypto = require('crypto')

exports.handler = async (event) => {
  try {
    const cookieHeader = event.headers.cookie || event.headers.Cookie || ''
    const cookies = parseCookie(cookieHeader)
    const token = cookies['cf_family_auth']
    if (!token) {
      return response(401, { error: 'Unauthorized' })
    }
    const [payloadB64, sig] = String(token).split('.')
    if (!payloadB64 || !sig) {
      return response(401, { error: 'Unauthorized' })
    }
    const expectedSig = hmacSha256Base64Url(process.env.FAMILY_AUTH_SIGNING_KEY || '', payloadB64)
    if (expectedSig !== sig) {
      return response(401, { error: 'Unauthorized' })
    }
    const payload = JSON.parse(base64urlDecode(payloadB64))
    const now = Math.floor(Date.now() / 1000)
    if (!payload || typeof payload.exp !== 'number' || payload.exp < now) {
      return response(401, { error: 'Unauthorized' })
    }

    // Demo data; replace with secure store or S3 later
    const body = {
      triggers: [
        { label: 'Both leave MS employment', status: 'Pending' },
        { label: '$2M ARR', status: 'In Progress' },
        { label: '$10M acquisition offer', status: 'Open' },
        { label: 'Jan 1, 2027', status: 'Time-based' },
      ],
      credits: [
        { person: 'Tyler', hours: 42, rate: 150, quarter: 'Q3 2025' },
        { person: 'Trevor', hours: 28, rate: 125, quarter: 'Q3 2025' },
        { person: 'Kendall', hours: 18, rate: 100, quarter: 'Q3 2025' },
      ],
    }
    return response(200, body)
  } catch (_e) {
    return response(500, { error: 'Server error' })
  }
}

function parseCookie(header) {
  return String(header)
    .split(';')
    .reduce((acc, part) => {
      const [k, v] = part.trim().split('=')
      if (k && v !== undefined) acc[k] = decodeURIComponent(v)
      return acc
    }, {})
}

function base64urlDecode(str) {
  const pad = str.length % 4 === 2 ? '==' : str.length % 4 === 3 ? '=' : ''
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(base64, 'base64').toString('utf8')
}

function hmacSha256Base64Url(secret, message) {
  const sig = crypto.createHmac('sha256', String(secret)).update(String(message)).digest('base64')
  return sig.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function response(statusCode, obj) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=30',
      'X-Robots-Tag': 'noindex, noarchive, nosnippet, noimageindex',
    },
    body: JSON.stringify(obj),
  }
}


