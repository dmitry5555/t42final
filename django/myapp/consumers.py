from channels.generic.websocket import AsyncWebsocketConsumer # type: ignore
# import json
import asyncio
import logging
import urllib.parse

logger = logging.getLogger(__name__)

class TestConsumer(AsyncWebsocketConsumer):
	rooms = {}  # словарь для хранения игроков по комнатам
	game_state = {}  # словарь для хранения состояния игры по комнатам
	game_running = {}  # словарь для хранения состояния игры (запущена или нет) по комнатам

	async def connect(self):
		logger.debug('WebSocket connection established')
		await self.accept()

		query_string = self.scope['query_string'].decode()
		query_params = urllib.parse.parse_qs(query_string)
		self.mode = query_params.get('mode', [None])[0]
		self.room_name = query_params.get('room', ['default'])[0]  # получаем комнату или используем 'default'

		if self.room_name not in TestConsumer.rooms:
			TestConsumer.rooms[self.room_name] = []

		# добавляем игрока в соответствующую комнату
		player_index = len(TestConsumer.rooms[self.room_name])
		TestConsumer.rooms[self.room_name].append(self)
		self.player_index = player_index

		# if only one payer
		if len(TestConsumer.rooms[self.room_name]) == 1:
			TestConsumer.game_state[self.room_name] = {
				'screen_width': 780,
				'screen_height': 400,
				'ball_x': 780 / 2,
				'ball_y': 400 / 2,
				'move_x': 8,  # speed x
				'move_y': 6,  # speed y
				'raquet_1': 400 / 2,
				'raquet_2': 400 / 2,
				'score_1': 0,
				'score_2': 0
			}
			TestConsumer.game_running[self.room_name] = False  # игра не запущена

		
		if len(TestConsumer.rooms[self.room_name]) == 1 and self.mode != '3':
			await self.start_game()
		if len(TestConsumer.rooms[self.room_name]) == 2 and self.mode == '3':
			await self.start_game()


	async def disconnect(self, close_code):
		# remove player on disconnect
		TestConsumer.rooms[self.room_name].remove(self)

		if len(TestConsumer.rooms[self.room_name]) == 0:
			del TestConsumer.rooms[self.room_name]
			del TestConsumer.game_state[self.room_name]
			del TestConsumer.game_running[self.room_name]

	async def start_game(self):
		if not TestConsumer.game_running[self.room_name]:  # проверка, запущена ли игра
			if len(TestConsumer.rooms[self.room_name]) == 2 and self.mode == '3':
				# await asyncio.sleep(0.1)
				self.update_task = asyncio.create_task(self.update_ball_position())
				TestConsumer.game_running[self.room_name] = True  # устанавливаем флаг, что игра запущена
			if len(TestConsumer.rooms[self.room_name]) == 1 and self.mode != '3':
				# await asyncio.sleep(0.1)
				self.update_task = asyncio.create_task(self.update_ball_position())
				TestConsumer.game_running[self.room_name] = True  # устанавливаем флаг, что игра запущена



	async def receive(self, text_data):
		# получение данных клиента
		try:
			raquet_1, raquet_2 = map(int, text_data.split(','))
			if TestConsumer.game_state.get(self.room_name) is not None:
				game_state = TestConsumer.game_state[self.room_name]
				
				if self.mode == '3':
					if self.player_index == 0:
						game_state['raquet_1'] = raquet_1
					elif self.player_index == 1:
						game_state['raquet_2'] = raquet_2
				else:
					game_state['raquet_1'] = raquet_1
					game_state['raquet_2'] = raquet_2

		except ValueError as e:
			logger.error(f"Получены некорректные данные: {text_data} - Ошибка: {e}")
			# pass  # игнорируем некорректные данные

	async def update_ball_position(self):
		while True:
			game = TestConsumer.game_state[self.room_name]

			# ball hit raquet or wall
			if game['ball_x'] < 3: 
				if game['ball_y'] >= game['raquet_1'] - 25 and game['ball_y'] <= game['raquet_1'] + 25:
					game['move_x'] *= -1
				else:
					game['ball_x'] = game['screen_width'] / 2
					game['ball_y'] = game['screen_height'] / 2
					game['score_2'] += 1
			
			if game['ball_x'] > game['screen_width'] - 3:
				if game['ball_y'] >= game['raquet_2'] - 25 and game['ball_y'] <= game['raquet_2'] + 25:
					game['move_x'] *= -1
				else:
					game['ball_x'] = game['screen_width'] / 2
					game['ball_y'] = game['screen_height'] / 2
					game['score_1'] += 1

			# up down bounce
			if game['ball_y'] >= game['screen_height'] or game['ball_y'] <= 0:
				game['move_y'] *= -1

			game['ball_y'] += game['move_y']
			game['ball_x'] += game['move_x']

			# limits
			game['ball_x'] = max(0, min(game['ball_x'], game['screen_width']))
			game['ball_y'] = max(0, min(game['ball_y'], game['screen_height']))

			# prepare coord. for sending
			game_data = f"{game['ball_x']},{game['ball_y']},{game['move_x']},{game['move_y']},{game['raquet_1']},{game['raquet_2']},{game['score_1']},{game['score_2']}"

			# sending data to players
			for player in TestConsumer.rooms[self.room_name]:
				await player.send(text_data=game_data)

			# delay till next iteration
			await asyncio.sleep(0.05)  # speed decrease
