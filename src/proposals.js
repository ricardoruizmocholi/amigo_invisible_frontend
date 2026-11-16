export function summarize(proposals) {
  const chosen = proposals.find((proposal) => proposal.chosen) ?? null;
  const topVotes = Math.max(0, ...proposals.map((proposal) => proposal.votes));
  const leaders = topVotes > 0 ? proposals.filter((proposal) => proposal.votes === topVotes) : [];
  return { chosen, topVotes, leaders };
}
