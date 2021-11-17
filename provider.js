const fs = require("fs");
const getKey = require("lodash.get");
const { Provider } = require("policyer");
const core = require("@actions/core");
const github = require("@actions/github");

class GithubProvider extends Provider {
  constructor(name = "todo-provider") {
    super(name);
  }

  async collect(configuration) {
    try {
      let data = {};
      const eventName = github.context.eventName;

      core.info(`Event name: ${eventName}`);
      const validEvents = configuration.validEvents;
      if (validEvents.indexOf(eventName) < 0) {
        core.setFailed(`Invalid event: ${eventName}`);
        throw new core.Error(`Invalid event: ${eventName}`);
      }

      if (configuration.type == "rest") {
        const authToken = core.getInput("github_token", { required: true });
        const args = Object.keys(configuration.args).reduce((acc, key) => {
          acc[key] = getKey(github, configuration.args[key]);
          return acc;
        }, {});
        console.log({ args });
        const client = github.getOctokit(authToken);
        const res = await client[configuration.type][configuration.domain][
          configuration.action
        ](args);
        data = res.data;
      }

      const env = Object.keys(process.env).reduce((acc, key) => {
        if (key.startsWith("GITHUB_") || key.startsWith("INPUT_")) {
          acc[key] = process.env[key];
        }
        return acc;
      }, {});

      const event = JSON.parse(
        fs.readFileSync(
          process.env.GITHUB_EVENT_PATH || "events/example.json",
          "utf8"
        )
      );

      if (process.env.INPUT_VERBOSE === "true") {
        console.log("data", JSON.stringify(data));
        console.log("env", JSON.stringify(env));
        console.log("event", JSON.stringify(event));
      }

      return { data, env, event };
    } catch (error) {
      console.error(error);
      core.setFailed(error.message);
      throw error;
    }
  }

  async evaluate({ configuration, checks }) {
    if (configuration.provider == "github-provider") {
      const data = await this.collect(configuration);
      const report = this.evaluateChecks(data, checks);

      return report;
    } else {
      throw new Error("Not a valid check.");
    }
  }
}

module.exports = GithubProvider;
