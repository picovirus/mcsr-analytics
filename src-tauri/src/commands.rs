use crate::speedrunigt::{get_records, Record};
use glob::PatternError;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    IoError(#[from] std::io::Error),

    #[error("{0}")]
    Other(String),
}

impl Error {
    #[must_use]
    pub const fn code(&self) -> &'static str {
        match self {
            Error::IoError(_) => "IoError",
            Error::Other(_) => "Other",
        }
    }
}

impl From<&str> for Error {
    fn from(str: &str) -> Error {
        Error::Other(str.to_string())
    }
}

impl From<PatternError> for Error {
    fn from(err: PatternError) -> Error {
        Error::Other(err.to_string())
    }
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        use serde::ser::SerializeStruct;

        let mut state = serializer.serialize_struct("Error", 2)?;
        state.serialize_field("code", &self.code())?;
        state.serialize_field("description", &self.to_string())?;
        state.end()
    }
}

#[tauri::command(async)]
pub async fn update_records(period: String) -> Result<Vec<Record>, Error> {
    get_records(period).await
}
