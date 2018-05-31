import { Component } from 'react';
import propTypes from 'prop-types';

import FormLabel from './FormLabel';
import InvalidFeedback from './InvalidFeedback';
import inputClassNames from '../utils/inputClassNames';

export default class TextField extends Component {

	static propTypes = {
		type: propTypes.string.isRequired,
		meta: propTypes.object.isRequired,
		input: propTypes.object.isRequired,
		label: propTypes.string,
		extra: propTypes.object
	};

	static defaultProps = {
		label: '',
		extra: {}
	};

	render() {

		const { type, meta, input, label, extra } = this.props;

		log('TextField -> render', { type, meta, input, label, extra });

		return (
			<div className='form-group row'>
				<FormLabel meta={ meta } input={ input }>{ label }</FormLabel>
				<div className='col-9'>
					<input
						className={ inputClassNames({ input, meta }) }
						type={ type }
						{ ...input }
						{ ...extra }
					/>
					<InvalidFeedback meta={ meta } />
				</div>
			</div>
		);
	}
}
