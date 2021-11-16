const getKey = require("lodash.get");
const { Provider } = require("policyer");
const core = require("@actions/core");
const github = require("@actions/github");
class GithubProvider extends Provider {
  constructor(name = "todo-provider") {
    super(name);
  }

  async collect(configuration) {
    const authToken = core.getInput("github_token", { required: true });
    const eventName = github.context.eventName;
    core.info(`Event name: ${eventName}`);
    const validEvents = configuration.validEvents;
    if (validEvents.indexOf(eventName) < 0) {
      core.setFailed(`Invalid event: ${eventName}`);
      throw new core.Error(`Invalid event: ${eventName}`);
    }
    const args = Object.keys(configuration.args).reduce((acc, key) => {
      acc[key] = getKey(github, configuration.args[key]);
      return acc;
    }, {});
    console.log({ args });
    const client = github.getOctokit(authToken);
    const { data } = await client[configuration.type][configuration.domain][
      configuration.action
    ](args);

    if (process.env.INPUT_VERBOSE === "true")
      console.log("data", JSON.stringify(data));
    return data;
  }

  async evaluate({ configuration, checks }) {
    if (configuration.provider == "github-provider") {
      const todo = await this.collect(configuration);
      const report = this.evaluateChecks(todo, checks);

      return report;
    } else {
      throw new Error("Not a valid check.");
    }
  }
}

module.exports = GithubProvider;
