import path from "node:path";
import { tests } from "@iobroker/testing";

// __dirname is build/test/ after compilation, navigate to project root
tests.packageFiles(path.join(__dirname, "..", ".."));
