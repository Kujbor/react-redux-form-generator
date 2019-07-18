import { PureComponent } from 'react';
import propTypes from 'prop-types';

export default class InvalidFeedback extends PureComponent {

	static propTypes = {
		meta: propTypes.object.isRequired
	}

	render() {

		const { meta } = this.props;

		return (
			<div className='invalid-feedback' style={ { display: 'block' } }>
				{ meta && meta.touched && meta.error }
			</div>
		);
	}
}
