import { expect } from "chai";
import { RateLimiter } from "../src/lib/rate-limiter";

const mockLog: ioBroker.Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    silly: () => {},
    level: "debug",
};

/** Mock timer adapter that doesn't actually schedule */
const mockTimers = {
    setInterval: () => ({} as ioBroker.Interval),
    clearInterval: () => {},
    setTimeout: () => ({} as ioBroker.Timeout),
    clearTimeout: () => {},
};

describe("RateLimiter", () => {
    it("should allow calls within limits", () => {
        const rl = new RateLimiter(mockLog, mockTimers, 5, 100);
        expect(rl.canMakeCall()).to.be.true;
    });

    it("should track daily usage", async () => {
        const rl = new RateLimiter(mockLog, mockTimers, 10, 100);
        let called = 0;

        await rl.tryExecute(async () => { called++; });
        await rl.tryExecute(async () => { called++; });
        await rl.tryExecute(async () => { called++; });

        expect(called).to.equal(3);
        expect(rl.dailyUsage).to.equal(3);
    });

    it("should queue calls when minute limit exceeded", async () => {
        const rl = new RateLimiter(mockLog, mockTimers, 2, 100);
        let called = 0;

        await rl.tryExecute(async () => { called++; }); // 1 — ok
        await rl.tryExecute(async () => { called++; }); // 2 — ok
        const queued = await rl.tryExecute(async () => { called++; }); // 3 — queued

        expect(called).to.equal(2);
        expect(queued).to.be.false;
    });

    it("should respect daily limit", async () => {
        const rl = new RateLimiter(mockLog, mockTimers, 100, 2);
        let called = 0;

        await rl.tryExecute(async () => { called++; }); // ok
        await rl.tryExecute(async () => { called++; }); // ok
        const queued = await rl.tryExecute(async () => { called++; }); // queued

        expect(called).to.equal(2);
        expect(queued).to.be.false;
        expect(rl.dailyUsage).to.equal(2);
    });
});
