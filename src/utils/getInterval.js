const getInterval = (score) => Math.max(150, 700 - Math.floor(score / 10) * 50);

export default getInterval;
