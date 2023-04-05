import { getConfig } from '../index';

type OutputLevel = 'verbose' | 'log' | 'chat';

const output = (message: string, level: OutputLevel) => {
	if (shouldLog(level)) {
		console.log(`${level}: ${message}`);
	}

	if (level === 'chat' && getConfig('CHAT_FEEDBACK')) {
		// TODO
	}
};

const shouldLog = (level: OutputLevel) => {
	const configLevel: OutputLevel = getConfig('LOG_LEVEL');

	switch (level) {
		case 'verbose':
			return configLevel === 'verbose';
		case 'log':
			return configLevel === 'verbose' || configLevel === 'log';
		case 'chat':
			return true;
		default:
			return false;
	}
};

export { output };
