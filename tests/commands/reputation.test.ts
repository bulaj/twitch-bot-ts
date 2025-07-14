import { RepCommand } from '../../src/commands/reputation/rep';
import { ReputationManager } from '../../src/database/reputation.manager';
import tmi from 'tmi.js';

jest.mock('../../src/database/reputation.manager');
const mockChangeReputation = ReputationManager.changeReputation as jest.Mock;
const mockGetUser = ReputationManager.getUser as jest.Mock;

describe('RepCommand', () => {
    let mockClient: tmi.Client;

    beforeEach(() => {
        mockClient = {
            say: jest.fn(),
        } as any;
        mockChangeReputation.mockClear();
        mockGetUser.mockClear();
        (mockClient.say as jest.Mock).mockClear();
    });

    it('should add reputation point with !rep+', () => {
        mockChangeReputation.mockReturnValue(5);
        const userstate = { username: 'user_a' };

        RepCommand.execute(mockClient, '#test', userstate as any, '!rep+ @user_b', ['@user_b']);

        expect(mockChangeReputation).toHaveBeenCalledWith('user_b', 1);
        expect(mockClient.say).toHaveBeenCalledWith('#test', 'Dodałeś punkt reputacji dla user_b! Ma teraz 5 pkt.');
    });

    it('should not allow user to change their own reputation', () => {
        const userstate = { username: 'user_a' };

        RepCommand.execute(mockClient, '#test', userstate as any, '!rep+ @user_a', ['@user_a']);

        expect(mockChangeReputation).not.toHaveBeenCalled();
        expect(mockClient.say).toHaveBeenCalledWith('#test', '@user_a, nie możesz zmieniać własnej reputacji.');
    });

    it('should show user reputation with !rep', () => {
        mockGetUser.mockReturnValue({ username: 'user_b', reputation: 10 });
        const userstate = { username: 'user_a' };

        RepCommand.execute(mockClient, '#test', userstate as any, '!rep @user_b', ['@user_b']);

        expect(mockGetUser).toHaveBeenCalledWith('user_b');
        expect(mockClient.say).toHaveBeenCalledWith('#test', 'Użytkownik user_b ma 10 punktów reputacji.');
    });
});
