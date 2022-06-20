import axios from 'axios'

var instance = axios.create({
    xsrfHeaderName: 'csrf-token',
})

export default instance
