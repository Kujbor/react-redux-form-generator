import { memo } from 'react';
import propTypes from 'prop-types';

import FormLabel from './FormLabel';
import InvalidFeedback from './InvalidFeedback';
import inputClassNames from '../utils/inputClassNames';

const TextField = ({ type, meta, input, label, extra, generator: { props: generatorProps } }) => {

	log('TextField -> render', { type, meta, input, label, extra, generatorProps });

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
};

TextField.propTypes = {
	type: propTypes.string.isRequired,
	meta: propTypes.object.isRequired,
	input: propTypes.object.isRequired,
	label: propTypes.string.isRequired,
	extra: propTypes.object.isRequired,
	generator: propTypes.object.isRequired
};

export default memo(TextField);
