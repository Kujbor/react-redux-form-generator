import { Component } from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';

import FormLabel from './FormLabel';
import InvalidFeedback from './InvalidFeedback';

export default class TextField extends Component {

	static propTypes = {
		type: propTypes.string,
		meta: propTypes.object,
		input: propTypes.object.isRequired,
		label: propTypes.string,
		readOnly: propTypes.bool
	};

	static defaultProps = {
		type: '',
		meta: {},
		label: '',
		readOnly: false
	};

	render() {

		const {
			type,
			meta,
			extra,
			input,
			label,
			readOnly,
			defaultValue,
		} = this.props;

		return (
			<div className='form-group row'>
				<FormLabel meta={ meta } input={ input }>{ label }</FormLabel>
				<div className='col-9'>
					<input
						id={ input.name }
						type={ type || 'text' }
						readOnly={ readOnly }
						className={ classNames({
							'form-control': true,
							'is-invalid': meta && meta.touched && (meta.warning || meta.error),
							'is-valid': meta && meta.touched && !(meta.warning || meta.error)
						}) }
					/>
					<InvalidFeedback meta={ meta } />
				</div>
			</div>
		);
	}
}
