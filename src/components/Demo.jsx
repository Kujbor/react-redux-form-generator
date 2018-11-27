import _ from 'lodash';
import { Component } from 'react';

import ReactReduxFormGeneratorWrapper from './ReactReduxFormGeneratorWrapper';

import formSchema from '../data/schema.json';
import initialValues from '../data/values.json';

export default class Demo extends Component {

	state = {
		savedValues: initialValues,
		invalidateFields: {}
	}

	componentWillMount() {

		const savedValues = JSON.parse(localStorage.getItem('demo'));

		log('Demo -> componentWillMount', { savedValues });

		if (savedValues) this.setState({ savedValues });
	}

	handleChange = values => {

		log('Demo -> handleChange', { values });
	}

	handleSubmit = values => {

		log('Demo -> handleSubmit', { values });

		localStorage.setItem('demo', JSON.stringify(values));
	}

	handleValidate = invalidateFields => {

		log('Demo -> handleValidate', { invalidateFields });

		this.setState({ invalidateFields });
	}

	render() {

		const { savedValues, invalidateFields } = this.state;

		log('Demo -> render', { savedValues, invalidateFields });

		return (
			<div className='container d-flex flex-column justify-content-center h-100'>
				<h2>ReactReduxFormGenerator</h2>
				<hr />
				<ReactReduxFormGeneratorWrapper
					id='demo'
					form='demo'
					schema={ formSchema }
					context={ this }
					initialValues={ savedValues }
					onChange={ this.handleChange }
					onSubmit={ this.handleSubmit }
					onValidate={ this.handleValidate }
				/>
				<div className='btn-group'>
					<button
						form='demo'
						type='submit'
						className='btn btn-primary btn-lg'
					>
						Submit after valid
					</button>
					<button
						form='demo'
						type='submit'
						disabled={ !_.isEmpty(invalidateFields) }
						className='btn btn-secondary btn-lg'
					>
						Disabled while invalid
					</button>
				</div>
			</div>
		);
	}
}
