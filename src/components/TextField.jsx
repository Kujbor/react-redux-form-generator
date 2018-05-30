import { Component } from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';

import log from '../utils/log';
import FormLabel from './FormLabel';
import InvalidFeedback from './InvalidFeedback';

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
		const { readOnly } = extra;

		log('TextField -> render', { meta, input, label, extra });

		return (
			<div className='form-group row'>
				<FormLabel meta={ meta } input={ input }>{ label }</FormLabel>
				<div className='col-9'>
					<input
						id={ input.name }
						type={ type.substr(1) }
						readOnly={ readOnly }
						className={ classNames({
							'form-control': true,
							'is-invalid': meta && meta.touched && (meta.warning || meta.error),
							'is-valid': meta && meta.touched && !(meta.warning || meta.error)
						}) }
						{ ...input }
						{ ...extra }
					/>
					<InvalidFeedback meta={ meta } />
				</div>
			</div>
		);
	}
}
