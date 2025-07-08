import axios from 'axios';

const BASE_URL = 'https://deusprogrammer.com/api/taco-truck';

const getAxiosOptions = ({ guestId } = {}) => {
    return {
        headers: {
            "X-Access-Token": localStorage.getItem("accessToken"),
            guestId
        }
    }
}

export const getComponents = async (guestId) => {
    const { data } = await axios.get(BASE_URL + `/components`, getAxiosOptions(guestId));
    return data;
}

export const getComponent = async (id, guestId) => {
    const { data } = await axios.get(BASE_URL + `/components/${id}`, getAxiosOptions(guestId));
    return data;
}

export const createComponent = async (component, guestId) => {
    const { data } = await axios.post(BASE_URL + `/components`, component, getAxiosOptions(guestId))
    return data;
}

export const deleteComponent = async (id, guestId) => {
    await axios.delete(BASE_URL + `/components/${id}`, getAxiosOptions(guestId));
}

export const updateComponent = async (id, component, guestId) => {
    const { data } = await axios.put(BASE_URL + `/components/${id}`, component, getAxiosOptions(guestId))
    return data;
}

export const getProjects = async (guestId) => {
    const { data } = await axios.get(BASE_URL + `/projects`, getAxiosOptions(guestId));
    return data;
}

export const getProject = async (id, guestId) => {
    const { data } = await axios.get(BASE_URL + `/projects/${id}`, getAxiosOptions(guestId));
    return data;
}

export const createProject = async (project, guestId) => {
    const { data } = await axios.post(BASE_URL + `/projects`, project, getAxiosOptions(guestId))
    return data;
}

export const deleteProject = async (id, guestId) => {
    await axios.delete(BASE_URL + `/projects/${id}`, getAxiosOptions(guestId));
}

export const updateProject = async (id, project, guestId) => {
    const { data } = await axios.put(BASE_URL + `/projects/${id}`, project, getAxiosOptions(guestId))
    return data;
}