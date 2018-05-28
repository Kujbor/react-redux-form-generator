import { Component } from 'react';
import propTypes from 'prop-types';

export default class InvalidFeedback extends Component {

	static propTypes = {
		meta: propTypes.object.isRequired
	}

	render() {

		const { meta } = this.props;

		return (
			<div className='invalid-feedback'>
				{ meta && meta.touched && meta.error }
				{ meta && meta.touched && meta.warning }
			</div>
		);
	}
}
