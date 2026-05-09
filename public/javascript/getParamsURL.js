export default function getParamsURL(params) {
    return new URLSearchParams(window.location.search).get(params);
}