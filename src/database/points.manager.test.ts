import { getPointsDb } from "./connection";
import {
  changePoints,
  getPointsUser,
  updateDuelStats,
  updateRobberyStats,
} from "./points.manager";

// Mock bazy danych
jest.mock("./connection", () => ({
  getPointsDb: jest.fn(),
}));

describe("Points Manager", () => {
  const mockDb = {
    prepare: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getPointsDb as jest.Mock).mockReturnValue(mockDb);
  });

  describe("getPointsUser", () => {
    it("powinno pobrać użytkownika z bazy danych", () => {
      const mockUser = {
        username: "testuser",
        points: 100,
        debt: 0,
      };
      const mockStmt = {
        get: jest.fn().mockReturnValue(mockUser),
      };
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = getPointsUser("TestUser");

      expect(mockDb.prepare).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE username = ?",
      );
      expect(mockStmt.get).toHaveBeenCalledWith("testuser");
      expect(result).toEqual(mockUser);
    });
  });

  describe("changePoints", () => {
    it("powinno zmienić punkty istniejącemu użytkownikowi", () => {
      const mockUser = { username: "testuser", points: 100 };
      const mockGetStmt = {
        get: jest.fn().mockReturnValue(mockUser),
      };
      const mockUpdateStmt = {
        get: jest.fn().mockReturnValue({ points: 150 }),
      };

      mockDb.prepare
        .mockReturnValueOnce(mockGetStmt)
        .mockReturnValueOnce(mockUpdateStmt);

      const result = changePoints("TestUser", 50);

      expect(result).toBe(150);
      expect(mockDb.prepare).toHaveBeenCalledTimes(2);
    });

    it("powinno utworzyć nowego użytkownika jeśli nie istnieje", () => {
      const mockGetStmt = {
        get: jest.fn().mockReturnValue(null),
      };
      const mockInsertStmt = {
        run: jest.fn(),
      };
      const mockUpdateStmt = {
        get: jest.fn().mockReturnValue({ points: 50 }),
      };

      mockDb.prepare
        .mockReturnValueOnce(mockGetStmt)
        .mockReturnValueOnce(mockInsertStmt)
        .mockReturnValueOnce(mockUpdateStmt);

      const result = changePoints("NewUser", 50);

      expect(result).toBe(50);
      expect(mockDb.prepare).toHaveBeenCalledTimes(3);
    });
  });

  describe("updateDuelStats", () => {
    it("powinno zaktualizować statystyki wygranej", () => {
      const mockStmt = {
        run: jest.fn(),
      };
      mockDb.prepare.mockReturnValue(mockStmt);

      updateDuelStats("testuser", true);

      expect(mockDb.prepare).toHaveBeenCalledWith(
        "UPDATE users SET wins = wins + 1 WHERE username = ?",
      );
      expect(mockStmt.run).toHaveBeenCalledWith("testuser");
    });

    it("powinno zaktualizować statystyki przegranej", () => {
      const mockStmt = {
        run: jest.fn(),
      };
      mockDb.prepare.mockReturnValue(mockStmt);

      updateDuelStats("testuser", false);

      expect(mockDb.prepare).toHaveBeenCalledWith(
        "UPDATE users SET losses = losses + 1 WHERE username = ?",
      );
      expect(mockStmt.run).toHaveBeenCalledWith("testuser");
    });
  });

  describe("updateRobberyStats", () => {
    it("powinno zaktualizować statystyki udanego napadu", () => {
      const mockGetStmt = {
        get: jest.fn().mockReturnValue({
          robberies: 5,
          successfulRobberies: 2,
        }),
      };
      const mockUpdateStmt = {
        run: jest.fn(),
      };

      mockDb.prepare
        .mockReturnValueOnce(mockGetStmt)
        .mockReturnValueOnce(mockUpdateStmt);

      updateRobberyStats("testuser", true);

      expect(mockUpdateStmt.run).toHaveBeenCalledWith(6, 3, "testuser");
    });

    it("powinno zaktualizować statystyki nieudanego napadu", () => {
      const mockGetStmt = {
        get: jest.fn().mockReturnValue({
          robberies: 5,
          successfulRobberies: 2,
        }),
      };
      const mockUpdateStmt = {
        run: jest.fn(),
      };

      mockDb.prepare
        .mockReturnValueOnce(mockGetStmt)
        .mockReturnValueOnce(mockUpdateStmt);

      updateRobberyStats("testuser", false);

      expect(mockUpdateStmt.run).toHaveBeenCalledWith(6, 2, "testuser");
    });
  });
});
