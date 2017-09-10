import axios from 'axios';

export default function getData() {
    const url = '/data/SORT1_1_1MB.json';

    return axios.get(url);
}
