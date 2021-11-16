const core = require("@actions/core");
const github = require("@actions/github");

const validEvent = ["pull_request"];

function validateTitlePrefix(title, prefix, caseSensitive) {
  if (!caseSensitive) {
    prefix = prefix.toLowerCase();
    title = title.toLowerCase();
  }
  return title.startsWith(prefix);
}

async function run() {
  try {
    const authToken = core.getInput("github_token", { required: true });
    const eventName = github.context.eventName;
    core.info(`Event name: ${eventName}`);
    if (validEvent.indexOf(eventName) < 0) {
      core.setFailed(`Invalid event: ${eventName}`);
      return;
    }

    const owner = github.context.payload.pull_request.base.user.login;
    const repo = github.context.payload.pull_request.base.repo.name;

    const client = github.getOctokit(authToken);
    // The pull request info on the context isn't up to date. When
    // the user updates the title and re-runs the workflow, it would
    // be outdated. Therefore fetch the pull request via the REST API
    // to ensure we use the current title.
    const { data: pullRequest } = await client.rest.pulls.get({
      owner,
      repo,
      pull_number: github.context.payload.pull_request.number,
    });
    console.log({ pullRequest });
    const { data: files } = await client.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: github.context.payload.pull_request.number,
    });
    console.log({ files });
    const { data: reviewers } = client.rest.pulls.listRequestedReviewers({
      owner,
      repo,
      pull_number,
    });
    console.log({ reviewers });
    const { data: reviews } = client.rest.pulls.listReviews({
      owner,
      repo,
      pull_number,
    });
    console.log({ reviews });
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

module.exports = run;
