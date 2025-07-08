import axios from 'axios';

const BASE_URL = 'https://deusprogrammer.com/api/taco-truck';

const getAxiosOptions = () => {
    return {
        headers: {
            "X-Access-Token": localStorage.getItem("accessToken")
        }
    }
}

export const getComponents = async () => {
    const { data } = await axios.get(BASE_URL + `/components`, getAxiosOptions());
    return data;
}

export const getComponent = async (id) => {
    const { data } = await axios.get(BASE_URL + `/components/${id}`, getAxiosOptions());
    return data;
}

export const createComponent = async (component) => {
    const { data } = await axios.post(BASE_URL + `/components`, component, getAxiosOptions())
    return data;
}

export const deleteComponent = async (id) => {
    await axios.delete(BASE_URL + `/components/${id}`, getAxiosOptions());
}

export const updateComponent = async (id, component) => {
    const { data } = await axios.put(BASE_URL + `/components/${id}`, component, getAxiosOptions())
    return data;
}

export const getProjects = async () => {
    const { data } = await axios.get(BASE_URL + `/projects`, getAxiosOptions());
    return data;
}

export const getProject = async (id) => {
    const { data } = await axios.get(BASE_URL + `/projects/${id}`, getAxiosOptions());
    return data;
}

export const createProject = async (project) => {
    const { data } = await axios.post(BASE_URL + `/projects`, project, getAxiosOptions())
    return data;
}

export const deleteProject = async (id) => {
    await axios.delete(BASE_URL + `/projects/${id}`, getAxiosOptions());
}

export const updateProject = async (id, project) => {
    const { data } = await axios.put(BASE_URL + `/projects/${id}`, project, getAxiosOptions())
    return data;
}