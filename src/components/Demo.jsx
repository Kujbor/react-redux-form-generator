import { Component } from 'react';

import schema from '../data/schema.json';
import TextField from './TextField';
import RadioField from './RadioField';
import SelectField from './SelectField';
import BlockWrapper from './BlockWrapper';
import FieldWrapper from './FieldWrapper';
import FormGenerator from './ReactReduxFormGenerator';

import * as validators from '../utils/validators';

export default class Demo extends Component {

	state = {
		values: {
			name: 'Олег',
			age: ['30'],
			sex: 'man',
			email: 'Kujbor@ya.ru',
			password: 'qwe'
		}
	}

	componentWillMount() {

		const savedValues = localStorage.getItem('demo');

		log('Demo -> componentWillMount', { savedValues });

		if (savedValues) this.setState({ values: JSON.parse(savedValues) });
	}

	handleSubmit = values => {

		log('Demo -> handleSubmit', { values });

		localStorage.setItem('demo', JSON.stringify(values));
	}

	render() {

		const { values } = this.state;

		return (
			<div className='container d-flex flex-column justify-content-center h-100'>
				<h2>ReactReduxFormGenerator</h2>
				<hr />
				<FormGenerator
					id='demo'
					form='demo'
					schema={ schema }
					blockSelector='.form-group'
					templates={{
						BlockWrapper,
						FieldWrapper,
						text: TextField,
						email: TextField,
						radios: RadioField,
						select: SelectField,
						password: TextField
					}}
					validators={ validators }
					initialValues={ values }
					onSubmit={ this.handleSubmit }
				/>
				<button type='submit' form='demo' className='btn btn-primary btn-lg'>Submit</button>
			</div>
		);
	}
}
