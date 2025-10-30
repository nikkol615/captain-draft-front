'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getTelegramUser, showBackButton, hideBackButton, hapticFeedback } from '@/lib/telegram';
import { api, type Player, type Lobby, type Team } from '@/lib/api';

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const lobbyCode = params.code as string;

  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Определяем роль текущего пользователя
  const currentPlayer = players.find(p => p.id === telegramUser?.id);
  const isOrganizer = lobby?.organizer_id === telegramUser?.id;
  const isLeader = currentPlayer?.status === 'leader';
  const userRole = isOrganizer ? 'Организатор' : isLeader ? 'Капитан' : 'Игрок';

  useEffect(() => {
    const user = getTelegramUser();
    setTelegramUser(user);

    // Для разработки
    if (!user) {
      setTelegramUser({
        id: Math.floor(Math.random() * 1000000),
        first_name: 'Test User'
      });
    }

    // Показываем кнопку назад
    showBackButton(() => {
      router.push('/');
    });

    return () => {
      hideBackButton();
    };
  }, [router]);

  useEffect(() => {
    if (telegramUser && lobbyCode) {
      loadLobbyData();
    }
  }, [telegramUser, lobbyCode]);

  const loadLobbyData = async () => {
    try {
      setLoading(true);
      // Сначала пытаемся просто получить лобби
      const data = await api.getLobbyByCode(lobbyCode);
      
      // Проверяем, есть ли текущий игрок в лобби
      const playerInLobby = data.players.find(p => p.id === telegramUser.id);
      
      if (!playerInLobby) {
        // Если игрока нет в лобби, присоединяемся
        const joinData = await api.joinLobby(lobbyCode, String(telegramUser.id));
        setLobby(joinData.lobby);
        setPlayers(joinData.players);
        setTeams(joinData.teams);
      } else {
        // Игрок уже в лобби
        setLobby(data.lobby);
        setPlayers(data.players);
        setTeams(data.teams);
      }
      
      setError('');
    } catch (err: any) {
      console.error('Error loading lobby:', err);
      setError('Не удалось загрузить лобби');
      hapticFeedback('error');
    } finally {
      setLoading(false);
    }
  };

  const copyLobbyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(lobbyCode);
      hapticFeedback('success');
      // TODO: показать уведомление
    }
  };

  // Получаем игроков по командам
  const getTeamPlayers = (teamId: number) => {
    return players.filter(p => p.player_team_id === teamId);
  };

  // Получаем игроков без команды
  const playersWithoutTeam = players.filter(p => p.status === 'out_of_team');

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-400 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-400 mt-4">Загрузка лобби...</p>
        </div>
      </main>
    );
  }

  if (error && !lobby) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
          <div className="text-center space-y-4">
            <div className="text-red-400 text-5xl">⚠️</div>
            <h2 className="text-white text-xl font-bold">Ошибка</h2>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Заголовок лобби */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Лобби</h1>
              <p className="text-gray-400 text-sm mt-1">Роль: {userRole}</p>
            </div>
            <div className="text-right">
              <button
                onClick={copyLobbyCode}
                className="bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 text-purple-200 font-mono text-xl font-bold py-2 px-4 rounded-xl transition-all"
              >
                {lobbyCode}
              </button>
              <p className="text-gray-500 text-xs mt-1">Нажмите чтобы скопировать</p>
            </div>
          </div>
        </div>

        {/* Команды */}
        {teams.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-white text-lg font-bold px-2">Команды</h2>
            {teams.map(team => {
              const teamPlayers = getTeamPlayers(team.id);
              const leader = teamPlayers.find(p => p.id === team.team_leader_id);
              
              return (
                <div key={team.id} className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold text-lg">{team.team_name}</h3>
                    <span className="text-purple-400 text-sm">
                      {teamPlayers.length} игроков
                    </span>
                  </div>
                  
                  {/* Капитан */}
                  {leader && (
                    <div className="mb-2">
                      <div className="bg-purple-600/20 border border-purple-400/30 rounded-lg p-2 flex items-center gap-2">
                        <span className="text-xl">👑</span>
                        <span className="text-purple-200 font-semibold">{leader.player_name}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Игроки команды */}
                  <div className="space-y-1">
                    {teamPlayers.filter(p => p.status === 'player').map(player => (
                      <div key={player.id} className="bg-gray-700/30 rounded-lg p-2 flex items-center gap-2">
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300">{player.player_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Игроки без команды */}
        {playersWithoutTeam.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-white text-lg font-bold px-2">
              Игроки без команды ({playersWithoutTeam.length})
            </h2>
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50 space-y-2">
              {playersWithoutTeam.map(player => (
                <div key={player.id} className="bg-gray-700/30 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-gray-300">{player.player_name}</span>
                  {isOrganizer && (
                    <button className="text-red-400 hover:text-red-300 text-sm">
                      Удалить
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Действия организатора */}
        {isOrganizer && (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50 space-y-3">
            <h2 className="text-white text-lg font-bold">Управление</h2>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
              Создать команду
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
              Начать драфт
            </button>
          </div>
        )}

        {/* Кнопка обновить */}
        <button
          onClick={loadLobbyData}
          className="w-full bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-bold py-3 px-6 rounded-xl transition-all"
        >
          🔄 Обновить
        </button>
      </div>
    </main>
  );
}

