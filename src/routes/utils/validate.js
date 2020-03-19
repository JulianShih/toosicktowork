const leaveType = ['personal', 'sick', 'annual', 'official', 'marriage', 'funeral', 'maternity', 'paternity',
  'menstruation', 'compensatory'];

const validate = (req) => {
  if (!req.body.type) {
    return false;
  }
  if (!leaveType.includes(req.body.type)) {
    return false;
  }
  if (!req.body.timeTo || !req.body.timeFrom) {
    return false;
  }
  const timeFrom = new Date(req.body.timeFrom);
  const timeTo = new Date(req.body.timeTo);
  try {
    timeTo.toISOString();
    timeFrom.toISOString();
  } catch (err) {
    if (err) {
      return false;
    }
  }
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);
  if (timeFrom < deadline) {
    return false;
  }
  const duration = (timeTo - timeFrom) / 3600000;
  return (duration >= 1);
};

export default validate;
