import { RateLimiterMemory } from 'rate-limiter-flexible'

// Configure for 10 failed attempts
const loginLimiter = new RateLimiterMemory({
    points : 10,
    duration : 30 * 60, // 30 Minutes
    blockDuration : 30 * 60, // Block 30 Minutes after hitting limit
})

export default loginLimiter