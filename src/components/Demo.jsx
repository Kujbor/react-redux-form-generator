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

	handleSubmit = values => log('Demo -> handleSubmit', { values })

	render() {

		return (
			<div className='container d-flex flex-column justify-content-center h-100'>
				<h2>ReactReduxFormGenerator</h2>
				<hr />
				<FormGenerator
					form='demo'
					schema={ schema }
					blockSelector='.form-group'
					validators={ validators }
					templates={{
						BlockWrapper,
						FieldWrapper,
						text: TextField,
						email: TextField,
						radios: RadioField,
						select: SelectField,
						password: TextField
					}}
					initialValues={{
						name: 'Олег',
						age: ['30'],
						sex: 'man',
						email: 'Kujbor@ya.ru',
						password: 'qwe'
					}}
					onSubmit={ this.handleSubmit }
				>
					<button
						type='submit'
						className='btn btn-primary btn-lg'
					>
						Submit
					</button>
				</FormGenerator>
			</div>
		);
	}
}
