import moment from 'moment';
import ReactDOM from 'react-dom';

import Demo from './components/Demo';

import './index.html';

log('builded at', moment(process.env.TIMESTAMP).format('dddd, Do MMMM YYYY, h:mm:ss a'), process.env.CI_RUNNER_REF, process.env.CI_RUNNER_JOB);

window.__app_body = document.body;
window.__app_html = document.documentElement;
window.__app_container = document.getElementById('root');

ReactDOM.render(<Demo />, __app_container);