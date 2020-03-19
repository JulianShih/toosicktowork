const toLocalISOString = (ISOString) => {
    const ISO = new Date(ISOString);
    return new Date(ISO.getFullYear(), ISO.getMonth(), ISO.getDate(),
        ISO.getHours(), ISO.getMinutes() - ISO.getTimezoneOffset(),
        ISO.getSeconds(), ISO.getMilliseconds()).toISOString().slice(0, -1);
};

export default toLocalISOString;
