import moment from 'moment';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { reducer as formReducer } from 'redux-form';
import { createStore, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import Demo from './components/Demo';

import './index.html';

log('builded at', moment(process.env.TIMESTAMP).format('dddd, Do MMMM YYYY, h:mm:ss a'));

const store = createStore(combineReducers({ form: formReducer }), composeWithDevTools());

render(
	<Provider store={ store }>
		<Demo />
	</Provider>,
	document.getElementById('root')
);
