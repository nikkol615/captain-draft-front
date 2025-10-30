import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://h4o0k0w0wco44ksgggcwgk8c.194.147.95.202.sslip.io';

export interface Player {
  id: number;
  player_name: string;
  player_team_id?: number;
  lobby_id?: number;
  status: 'inactive' | 'leader' | 'player' | 'out_of_team';
}

export interface Lobby {
  id: number;
  lobby_code: string;
  organizer_id: number;
}

export interface Team {
  id: number;
  lobby_id: number;
  team_name: string;
  team_leader_id: number;
}

export const api = {
  // Добавить игрока
  addPlayer: async (playerName: string, playerId: string): Promise<Player> => {
    const response = await axios.post(`${API_BASE_URL}/add_player`, null, {
      params: { player_name: playerName, player_id: playerId }
    });
    return response.data;
  },

  // Создать лобби
  createLobby: async (playerId: string): Promise<Lobby> => {
    const response = await axios.post(`${API_BASE_URL}/create_lobby`, null, {
      params: { player_id: playerId }
    });
    return response.data;
  },

  // Присоединиться к лобби
  joinLobby: async (lobbyCode: string, playerId: string): Promise<{ lobby: Lobby; players: Player[]; teams: Team[] }> => {
    const response = await axios.post(`${API_BASE_URL}/join_lobby`, null, {
      params: { lobby_code: lobbyCode, player_id: playerId }
    });
    return response.data;
  },

  // Создать команду
  createTeam: async (lobbyId: string, teamName: string, teamLeaderId: string): Promise<Team> => {
    const response = await axios.post(`${API_BASE_URL}/create_team`, null, {
      params: { lobby_id: lobbyId, team_name: teamName, team_leader_id: teamLeaderId }
    });
    return response.data;
  },

  // Добавить игрока в команду
  addPlayerToTeam: async (teamId: string, playerId: string): Promise<Player> => {
    const response = await axios.post(`${API_BASE_URL}/add_player_to_team`, null, {
      params: { team_id: teamId, player_id: playerId }
    });
    return response.data;
  },

  // Получить игроков лобби
  getLobbyPlayers: async (lobbyId: string): Promise<Player[]> => {
    const response = await axios.get(`${API_BASE_URL}/get_lobby_players`, {
      params: { lobby_id: lobbyId }
    });
    return response.data;
  },

  // Получить команды лобби
  getLobbyTeams: async (lobbyId: string): Promise<Team[]> => {
    const response = await axios.get(`${API_BASE_URL}/get_lobby_teams`, {
      params: { lobby_id: lobbyId }
    });
    return response.data;
  },

  // Получить лобби по коду (без присоединения)
  getLobbyByCode: async (lobbyCode: string): Promise<{ lobby: Lobby; players: Player[]; teams: Team[] }> => {
    const response = await axios.get(`${API_BASE_URL}/get_lobby_by_code`, {
      params: { lobby_code: lobbyCode }
    });
    return response.data;
  }
};

