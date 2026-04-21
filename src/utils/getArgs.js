const getArgs = (qs) => {
  const args = {};
  try {
    const search = qs !== undefined ? qs.split('?')[1].split('#')[0] : window.location.search.split('?')[1];
    search.split('&').forEach(pair => {
      const [key, val] = pair.split('=');
      args[key] = val;
    });
  } catch (e) {
    // no query string
  }
  return args;
};

export default getArgs;
