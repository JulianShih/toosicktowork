const setOverlapFilter = (user, leave, id) => {
  const filter = {
    username: user,
    $or: [
      { timeFrom: { $gte: leave.timeFrom, $lt: leave.timeTo } },
      { timeTo: { $gt: leave.timeFrom, $lte: leave.timeTo } },
      {
        timeFrom: { $lt: leave.timeFrom },
        timeTo: { $gt: leave.timeTo },
      }],
  };
  if (id) {
    filter.id = { $ne: id };
  }
  return filter;
};

export default setOverlapFilter;
