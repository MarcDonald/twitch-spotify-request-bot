import { beforeEach } from 'vitest';

import {
	getConfigMockImplementation,
	TEST_CONFIG_WITH_PLAYLIST,
} from '../../test/utils/test-configs';
import { getConfig } from '../index';

import { output } from './output';

vi.mock('../index', () => ({
	getConfig: vi.fn(),
}));

describe('output', () => {
	beforeEach(() => {
		console.log = vi.fn();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('when LOG_LEVEL=verbose', () => {
		// arrange
		vi.mocked(getConfig).mockImplementation((name) =>
			getConfigMockImplementation(name, {
				...TEST_CONFIG_WITH_PLAYLIST,
				LOG_LEVEL: 'verbose',
			})
		);

		// act
		output('test message', 'verbose');
		output('test message', 'log');
		output('test message', 'chat');

		// assert
		expect(console.log).toHaveBeenCalledTimes(3);
		expect(console.log).toHaveBeenCalledWith('verbose: test message');
		expect(console.log).toHaveBeenCalledWith('log: test message');
		expect(console.log).toHaveBeenCalledWith('chat: test message');
	});

	test('when LOG_LEVEL=log', () => {
		// arrange
		vi.mocked(getConfig).mockImplementation((name) =>
			getConfigMockImplementation(name, {
				...TEST_CONFIG_WITH_PLAYLIST,
				LOG_LEVEL: 'log',
			})
		);

		// act
		output('test message', 'verbose');
		output('test message', 'log');
		output('test message', 'chat');

		// assert
		expect(console.log).toHaveBeenCalledTimes(2);
		expect(console.log).not.toHaveBeenCalledWith('verbose: test message');
		expect(console.log).toHaveBeenCalledWith('log: test message');
		expect(console.log).toHaveBeenCalledWith('chat: test message');
	});

	test('when LOG_LEVEL=chat', () => {
		// arrange
		vi.mocked(getConfig).mockImplementation((name) =>
			getConfigMockImplementation(name, {
				...TEST_CONFIG_WITH_PLAYLIST,
				LOG_LEVEL: 'chat',
			})
		);

		// act
		output('test message', 'verbose');
		output('test message', 'log');
		output('test message', 'chat');

		// assert
		expect(console.log).toHaveBeenCalledTimes(1);
		expect(console.log).not.toHaveBeenCalledWith('verbose: test message');
		expect(console.log).not.toHaveBeenCalledWith('log: test message');
		expect(console.log).toHaveBeenCalledWith('chat: test message');
	});

	test('when chat feedback is enabled', () => {
		// arrange
		vi.mocked(getConfig).mockImplementation((name) =>
			getConfigMockImplementation(name, {
				...TEST_CONFIG_WITH_PLAYLIST,
				CHAT_FEEDBACK: true,
			})
		);

		// act
		output('test message', 'verbose');
		output('test message', 'log');
		output('test message', 'chat');

		// assert
		// TODO
	});
});
