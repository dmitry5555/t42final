'use client'

import { addUserToGame, closeUserGame, createUserGame, findPendingGame } from '@/actions/actions';
import { useEffect, useRef, useState, useCallback } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

function GameRoom({mode, players, scoresUpdate}: {mode: number, players: any, scoresUpdate: any}) {
	const clientRef = useRef<W3CWebSocket | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const contextRef = useRef<CanvasRenderingContext2D | null>(null);
	const [squareX, setSquareX] = useState(0);
	const [squareY, setSquareY] = useState(0);
	const [isPlayerOne, setIsPlayerOne] = useState<boolean | null>(null)

    const [velocityX, setVelocityX] = useState(0);
    const [velocityY, setVelocityY] = useState(0);
	
	const [score1, setScore1] = useState(0);
	const [score2, setScore2] = useState(0);
	const [paddle1Y, setPaddle1Y] = useState(200); // initial raquet position
	const [paddle2Y, setPaddle2Y] = useState(200); // initial raquet position
	const squareSize = 2;
	const paddleWidth = 2;
	const paddleHeight = 50;
	const screen = { w: 780, h: 400 }
	const [pressedKeys, setPressedKeys] = useState<{ [key: string]: boolean }>({});

    // ======= AI Logic variables =======
    const [aiX, setAiX] = useState(screen.w / 2);
    const [aiY, setAiY] = useState(screen.h / 2);
    const aiXRef = useRef(squareX);
    const aiYRef = useRef(squareY);
    const [aiVelocityX, setAiVelocityX] = useState(0);
    const [aiVelocityY, setAiVelocityY] = useState(0);
    const aiVelocityXRef = useRef(velocityX);
    const aiVelocityYRef = useRef(velocityY);
    const [predictedY, setPredictedY] = useState(Math.round(screen.h / 2));
    // State for keyboard presses emulation
    const [aiKeys, setAiKeys] = useState<{ up: boolean; down: boolean }>({ up: false, down: false });
    // ======= End of AI Logic variables =======
	
    // ====== AI Logic ======
    // Effect to update the refs when the ball's position changes
    useEffect(() => {
        aiXRef.current = squareX;
        aiYRef.current = squareY;
        aiVelocityXRef.current = velocityX;
        aiVelocityYRef.current = velocityY;
    }, [squareX, squareY, velocityX, velocityY]);

    // Effect to handle AI view updates at regular intervals
    useEffect(() => {
        const updateAIView = () => {
            // Update AI state with the current ball positions and velocity
            setAiX(aiXRef.current);
            setAiY(aiYRef.current);
            setAiVelocityX(aiVelocityXRef.current);
            setAiVelocityY(aiVelocityYRef.current);
        };
        // Set an interval to update AI's view every 1 second
        const intervalId = setInterval(updateAIView, 1000);
        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const updateAIPaddle = () => {
            if (velocityX < 0 && velocityX !== 0 && velocityY !== 0 && aiX < screen.w * 0.95) {
                // Calculate the time it takes for the ball to reach the AI's paddle
                const distanceToPaddleX = aiX - paddleWidth;
                const timeToReach = distanceToPaddleX / -aiVelocityX;
                // Calculate the unnormalized Y position of the ball when it reaches the paddle
                let unNormalizedY = Math.round(aiY + aiVelocityY * timeToReach);
                // Normalize the Y position to handle rebounds
                if (unNormalizedY < 0 || unNormalizedY > screen.h) {
                    let normalizedY = unNormalizedY % (2 * screen.h);
                    // If normalizedY is negative, adjust it to be within the bounds
                    if (normalizedY < 0) {
                        normalizedY += 2 * screen.h;
                    }
                    const distance = Math.round(aiX / 50);
                    setPredictedY(
                        Math.max(0, Math.min(
                            (normalizedY > screen.h ? 
                            (2 * screen.h - normalizedY) : normalizedY)
                        + Math.round((Math.random() * distance - distance / 2) * 10),
                        screen.h))
                    );
                }
            } else {
                setPredictedY((Math.round(screen.h / 2)));
            }
        };
        updateAIPaddle();
    }, [aiX, aiY, aiVelocityX, aiVelocityY, screen.h, screen.w, velocityX, velocityY]);

    // Effect to handle key's presses
    useEffect(() => {
        const inaccuracy = Math.floor(Math.random() * 16) + 10;
        if (Math.abs(predictedY - paddle1Y) < inaccuracy) {
            setAiKeys({ up: false, down: false });
        } else {
            setAiKeys({
                up: predictedY < paddle1Y,
                down: predictedY > paddle1Y,
            });
        }
    }, [predictedY, paddle1Y]);


	const drawSquare = useCallback((x: number, y: number) => {
		const canvas = canvasRef.current;
		const context = contextRef.current;
		if (canvas && context) {
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = 'white';
			context.fillRect(x, y, squareSize, squareSize);
			// draw raquet
			context.fillRect(0, paddle1Y - paddleHeight/2, paddleWidth, paddleHeight);
			context.fillRect(screen.w-paddleWidth, paddle2Y - paddleHeight/2, paddleWidth, paddleHeight);
		}
	}, [paddle1Y, paddle2Y, screen.w]);

	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		setPressedKeys((prevKeys) => ({
		  ...prevKeys,
		  [event.key]: true,
		}));
	}, []);
	  
	const handleKeyUp = useCallback((event: KeyboardEvent) => {
		setPressedKeys((prevKeys) => ({
			...prevKeys,
			[event.key]: false,
		}));
	}, []);
	  
	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, [handleKeyDown, handleKeyUp]);
	

	useEffect(() => {
		let intervalId: ReturnType<typeof setInterval> | null = null;
	  
		const updatePaddle = () => {

			if (mode === 1) { // AI mode
				setPaddle1Y((prevPaddle1Y) => {
					let newPaddle1Y = prevPaddle1Y;
					if (aiKeys.up) {
						newPaddle1Y = Math.max(0 + paddleHeight / 2, newPaddle1Y - 5);
					}
					if (aiKeys.down) {
						newPaddle1Y = Math.min(screen.h - paddleHeight / 2, newPaddle1Y + 5);
					}
					return newPaddle1Y;
				});
				setPaddle2Y((prevPaddle2Y) => {
					let newPaddle2Y = prevPaddle2Y;
					if (pressedKeys['ArrowUp']) {
						newPaddle2Y = Math.max(0 + paddleHeight / 2, newPaddle2Y - 5);
					}
					if (pressedKeys['ArrowDown']) {
						newPaddle2Y = Math.min(screen.h - paddleHeight / 2, newPaddle2Y + 5);
					}
					return newPaddle2Y;
				});
			}

			else if (mode === 3) { // remote mode
				// move only paddle 1 if youre player 1
				if (isPlayerOne) {
					setPaddle1Y((prevPaddle1Y) => {
						let newPaddle1Y = prevPaddle1Y
						if (pressedKeys['q'] || pressedKeys['Q']) {
							newPaddle1Y = Math.max(0 + paddleHeight / 2, newPaddle1Y - 5);
						}
						if (pressedKeys['a'] || pressedKeys['A']) {
							newPaddle1Y = Math.min(screen.h - paddleHeight / 2, newPaddle1Y + 5);
						}
						return newPaddle1Y;
					})
				}
				// move only paddle 2 if youre player 2
				else {
					setPaddle2Y((prevPaddle2Y) => { // move paddle with keyboard
						let newPaddle2Y = prevPaddle2Y
						if (pressedKeys['ArrowUp']) {
							newPaddle2Y = Math.max(0 + paddleHeight / 2, newPaddle2Y - 5);
						}
						if (pressedKeys['ArrowDown']) {
							newPaddle2Y = Math.min(screen.h - paddleHeight / 2, newPaddle2Y + 5);
						}
						return newPaddle2Y;
					});
				}
			}

			else {
				setPaddle1Y((prevPaddle1Y) => {
					let newPaddle1Y = prevPaddle1Y
					if (pressedKeys['q'] || pressedKeys['Q']) {
						newPaddle1Y = Math.max(0 + paddleHeight / 2, newPaddle1Y - 5);
					}
					if (pressedKeys['a'] || pressedKeys['A']) {
						newPaddle1Y = Math.min(screen.h - paddleHeight / 2, newPaddle1Y + 5);
					}
					return newPaddle1Y;
				});
				setPaddle2Y((prevPaddle2Y) => {
					let newPaddle2Y = prevPaddle2Y
					if (pressedKeys['ArrowUp']) {
						newPaddle2Y = Math.max(0 + paddleHeight / 2, newPaddle2Y - 5);
					}
					if (pressedKeys['ArrowDown']) {
						newPaddle2Y = Math.min(screen.h - paddleHeight / 2, newPaddle2Y + 5);
					}
					return newPaddle2Y;
				});
			};
		}
	  
		const startUpdatingPaddles = () => {
		  	intervalId = setInterval(updatePaddle, 16); // 16ms = 60 FPS
		};
	  
		const stopUpdatingPaddles = () => {
		  if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		  }
		};
		startUpdatingPaddles();	  
		return stopUpdatingPaddles;
	  }, [pressedKeys, aiKeys, screen.h, mode]);

	useEffect(() => {

		let roomId : number 
		const fetchData = async () => {

			if (mode === 3) {
				const data = await findPendingGame();
				if (!data) {
					console.log('no pending game -> creating a new game')
					roomId = await createUserGame('pending')
					setIsPlayerOne(true)
				} else {
					console.log('pending game found: ', data)
					console.log('adding user to game: ', data)
					const success_added = await addUserToGame(data)
					if (!success_added) return 
					roomId = data.id
					setIsPlayerOne(false)
				}
			} else {
				roomId = await createUserGame('single')
				setIsPlayerOne(true)
			}
			const ip = window.location.hostname
			const client = new W3CWebSocket(`wss://${ (ip == '10.19.231.216') ? '10.19.231.216' : 'localhost' }/ws/?mode=${mode}&room=${roomId}`);
			// const client = new W3CWebSocket(`wss://localhost/ws/?mode=${mode}&room=${roomId}`);
			
			client.onopen = () => {
				console.log('WebSocket Client Connected ✅');
				startUpdatingSquarePosition();
			};
	
			const startUpdatingSquarePosition = () => {
				if (clientRef.current && clientRef.current.readyState === clientRef.current.OPEN) {
					clientRef.current.send('get_position');
					setTimeout(startUpdatingSquarePosition, 100);
				} else {
					console.log('Cannot update square position: WebSocket is not open');
				}
			};
	
			client.onmessage = (message) => {
				const [x, y, move_x, move_y, raquet_1, raquet_2, bscore1, bscore2] = (message.data as string).split(',').map(Number);
				setSquareX(x);
				setSquareY(y);
				if (mode === 1) {
					setVelocityX(move_x);
					setVelocityY(move_y);
				}
				if (bscore1 == 5 || bscore2 == 5) {
					closeUserGame(roomId, 'finished', bscore1, score2)
					// проброс счета в родитель для отображения результатов
					scoresUpdate(bscore1, bscore2);
					client.close();
				}
				setScore1(bscore1);
				setScore2(bscore2);
				
				if (mode === 3) {
					setPaddle1Y(raquet_1);
					setPaddle2Y(raquet_2);
				}
			};
			
			client.onerror = (error) => {
				console.log('WebSocket Error:', error);
			};
			
			client.onclose = (event) => {
				console.log('preparing to closeUserGame (any case) - roomId, score1, score2: ', roomId, score1, score2);
				console.log('WebSocket Closed:', event);
				console.log('Close code:', event.code);
				console.log('Close reason:', event.reason);
			};
	
			clientRef.current = client;
		};
	
		fetchData();

		// canvas
		const canvas = canvasRef.current;
		if (canvas) {
			const context = canvas.getContext('2d');
			if (context) {
				contextRef.current = context;
			}
		}

		// keyb handler
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			if (clientRef.current) {
				clientRef.current.close();
			}
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [mode]);

	useEffect(() => {
		drawSquare(squareX, squareY);
	}, [squareX, squareY, drawSquare]);

	useEffect(() => {
		// send coord. to server
		if (clientRef.current && clientRef.current.readyState === clientRef.current.OPEN) {
			clientRef.current.send(Math.round(paddle1Y)+','+Math.round(paddle2Y))
			if (mode === 3) {
				clientRef.current.send(`move_paddle,${isPlayerOne ? paddle1Y : paddle2Y}`);
			}
		}
	}, [paddle1Y, paddle2Y]);

  	return (
		<div className='flex flex-col h-screen items-center justify-center relative'>
			<div className='flex w-full justify-center absolute top-0 h-screen items-center'>
				<div className='flex-1 text-white text-center'>{score1}</div>
				<div className='flex-1 text-white text-center'>{score2}</div>
			</div>
			<canvas ref={canvasRef} width={screen.w} height={screen.h} className='bg-black w-full h-full'/>
		</div>
	);
}

export default GameRoom