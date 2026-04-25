import { expect } from "chai";
import { GoveeOpenapiMqttClient } from "../src/lib/govee-openapi-mqtt-client";

/**
 * Lifecycle tests for the OpenAPI-MQTT client (constructor + disconnect).
 *
 * Event-handling tests (`handleOpenApiEvent` on DeviceManager) follow in
 * session 6 once the device-manager learns to consume the event payload
 * and route it through the new events/ channel.
 */

const mockLog: ioBroker.Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    silly: () => {},
    level: "debug",
};

const mockTimers = {
    setInterval: () => undefined,
    clearInterval: () => {},
    setTimeout: () => undefined,
    clearTimeout: () => {},
};

describe("GoveeOpenapiMqttClient", () => {
    describe("constructor", () => {
        it("creates a client with the given API key", () => {
            const client = new GoveeOpenapiMqttClient(
                "test-api-key",
                mockLog,
                mockTimers as never,
            );
            expect(client).to.exist;
            expect(client.connected).to.be.false;
        });
    });

    describe("disconnect", () => {
        it("handles disconnect when not connected", () => {
            const client = new GoveeOpenapiMqttClient(
                "test-api-key",
                mockLog,
                mockTimers as never,
            );
            expect(() => client.disconnect()).to.not.throw();
        });

        it("leaves the connected flag false after disconnect", () => {
            const client = new GoveeOpenapiMqttClient(
                "test-api-key",
                mockLog,
                mockTimers as never,
            );
            client.disconnect();
            expect(client.connected).to.be.false;
        });
    });
});
