from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# Secret key (change this in production)
SECRET_KEY = "fridgeai_secret_key_12345"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# -------------------------
# Password Hashing
# -------------------------
def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(
    plain_password,
    hashed_password
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# -------------------------
# JWT Token
# -------------------------
def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def decode_token(token: str):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        return None