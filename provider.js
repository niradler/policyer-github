const { Provider } = require("policyer");

class GithubProvider extends Provider {
  constructor(name = "todo-provider") {
    super(name);
  }

  async collect(configuration) {
    console.log(process.env);
    return process.env;
  }

  async evaluate({ configuration, checks }) {
    if (configuration.type == "github") {
      const todo = await this.collect(configuration);
      const report = this.evaluateChecks(todo, checks);

      return report;
    } else {
      throw new Error("Not a valid check.");
    }
  }
}

module.exports = GithubProvider;
