"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rep_1 = require("./reputation");
const reputation_manager_1 = require("../../database/reputation.manager");
jest.mock("../../database/reputation.manager");
const mockChangeReputation =
  reputation_manager_1.ReputationManager.changeReputation;
const mockGetUser = reputation_manager_1.ReputationManager.getUser;
describe("RepCommand", () => {
  let mockClient;
  beforeEach(() => {
    mockClient = {
      say: jest.fn(),
    };
    mockChangeReputation.mockClear();
    mockGetUser.mockClear();
    mockClient.say.mockClear();
  });
  it("should add reputation point with !rep+", () => {
    mockChangeReputation.mockReturnValue(5);
    const userstate = { username: "user_a" };
    rep_1.RepCommand.execute(mockClient, "#test", userstate, "!rep+ @user_b", [
      "@user_b",
    ]);
    expect(mockChangeReputation).toHaveBeenCalledWith("user_b", 1);
    expect(mockClient.say).toHaveBeenCalledWith(
      "#test",
      "Dodałeś punkt reputacji dla user_b! Ma teraz 5 pkt.",
    );
  });
  it("should not allow user to change their own reputation", () => {
    const userstate = { username: "user_a" };
    rep_1.RepCommand.execute(mockClient, "#test", userstate, "!rep+ @user_a", [
      "@user_a",
    ]);
    expect(mockChangeReputation).not.toHaveBeenCalled();
    expect(mockClient.say).toHaveBeenCalledWith(
      "#test",
      "@user_a, nie możesz zmieniać własnej reputacji.",
    );
  });
  it("should show user reputation with !rep", () => {
    mockGetUser.mockReturnValue({ username: "user_b", reputation: 10 });
    const userstate = { username: "user_a" };
    rep_1.RepCommand.execute(mockClient, "#test", userstate, "!rep @user_b", [
      "@user_b",
    ]);
    expect(mockGetUser).toHaveBeenCalledWith("user_b");
    expect(mockClient.say).toHaveBeenCalledWith(
      "#test",
      "Użytkownik user_b ma 10 punktów reputacji.",
    );
  });
});
