const express = require('express');
const router = express.Router(); // 중요: 라우터 객체 생성
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JWT 시크릿 키 (임시)
const JWT_SECRET = "my_super_secret_access_key";
const JWT_REFRESH_SECRET = "my_super_secret_refresh_key";

// DB/Redis 연결 전 가짜 데이터 저장소 (임시)
const mockUsersDB = [];
const mockRedis = {};

// 1. 회원가입 API
// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // 이메일 중복 검사
        const existingUser = mockUsersDB.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({ success: false, message: "이미 존재하는 이메일입니다." });
        }

        // 비밀번호 bcrypt 해시 암호화
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // DB에 사용자 정보 저장
        const newUser = {
            id: mockUsersDB.length + 1,
            email,
            password_hash,
            name,
            provider: 'local',
            created_at: new Date()
        };
        mockUsersDB.push(newUser);

        //  토큰 발급
        const accessToken = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId: newUser.id }, JWT_REFRESH_SECRET, { expiresIn: '14d' });

        // Refresh Token을 Redis에 저장 (TODO:REDIS에 저장)
        mockRedis[newUser.id] = refreshToken;

        res.status(201).json({
            success: true,
            message: "회원가입이 완료되었습니다.",
            data: { accessToken, refreshToken, user: { id: newUser.id, name: newUser.name, email: newUser.email } }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "회원가입 처리 중 오류가 발생했습니다." });
    }
});

// 2. 로그인 API
// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 이메일로 사용자 검증
        const user = mockUsersDB.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ success: false, message: "이메일 또는 비밀번호가 일치하지 않습니다." });
        }

        // 비밀번호 일치 여부 검증
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "이메일 또는 비밀번호가 일치하지 않습니다." });
        }

        // JWT 토큰 발급
        const accessToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '14d' });

        // Refresh Token 저장 (TODO:REDIS에 저장)
        mockRedis[user.id] = refreshToken;

        res.status(200).json({
            success: true,
            message: "로그인에 성공했습니다.",
            data: { accessToken, refreshToken }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "로그인 처리 중 오류가 발생했습니다." });
    }
});

// 3. 로그아웃 API
// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
    try {
        const { userId } = req.body;

        // 해당 사용자의 Refresh Token 삭제 (TODO:REDIS)
        if (mockRedis[userId]) {
            delete mockRedis[userId];
        }

        res.status(200).json({
            success: true,
            message: "성공적으로 로그아웃 되었습니다."
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "로그아웃 처리 중 오류가 발생했습니다." });
    }
});

// 중요: 라우터 객체를 모듈로 내보내기 (이 부분이 없거나 오타가 나면 에러가 발생합니다)
module.exports = router;