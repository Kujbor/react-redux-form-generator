import { Component } from 'react';

import schema from '../data/schema.json';
import FormGenerator from './ReactReduxFormGenerator';

export default class Demo extends Component {

	render() {

		return (
			<div className='container d-flex flex-column justify-content-center h-100'>
				<h2>ReactReduxFormGenerator</h2>
				<hr />
				<FormGenerator
					form='demo'
					schema={ schema }
					blockSelector='.form-group'
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
