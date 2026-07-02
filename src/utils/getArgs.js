const getArgs = (searchString = window.location.search) => {
  try {
    const params = new URLSearchParams(searchString);
    return Object.fromEntries(params);
  } catch (e) {
    return {};
  }
};

export default getArgs;
