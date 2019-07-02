export const setParams = ({query = ""}) => {
    const searchParams = new URLSearchParams();
    searchParams.set("query", query);
    return searchParams.toString();
};

export const getParams = (location) => {
    const searchParams = new URLSearchParams(location.search);
    return {
        query: searchParams.get('query') || '',
    };
};
