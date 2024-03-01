use std::fs::File;
use std::io::BufReader;
use std::path::PathBuf;
use std::time::{Duration, SystemTime};
use dirs::home_dir;
use glob::glob;
use serde::{Deserialize, Serialize};
use crate::commands::Error;

#[derive(Serialize, Deserialize)]
pub struct Record {
    #[serde(default)]
    key: i32,
    #[serde(default)]
    file: String,
    mc_version: String,
    category: String,
    run_type: String,
    is_completed: bool,
    is_coop: bool,
    is_hardcore: bool,
    world_name: String,
    #[serde(default)]
    is_cheat_allowed: bool,
    date: i64,
    retimed_igt: i32,
    final_igt: i32,
    final_rta: i32,
    timelines: Vec<Timeline>,

    #[serde(default)]
    enter_nether: i32,
    #[serde(default)]
    enter_bastion: i32,
    #[serde(default)]
    enter_fortress: i32,
    #[serde(default)]
    nether_travel: i32,
    #[serde(default)]
    enter_stronghold: i32,
    #[serde(default)]
    enter_end: i32,
}

#[derive(Serialize, Deserialize)]
struct Timeline {
    name: String,
    igt: i32,
    rta: i32,
}

fn get_record_files(period: String) -> Result<Vec<PathBuf>, Error> {
    let mut records_folder: PathBuf;

    match home_dir() {
        Some(home_path) => {
            records_folder = home_path;
            records_folder.push("speedrunigt/records/");
        }
        None => {
            return Err(Error::Other("Home dir not found!".to_string()));
        }
    }

    let mut record_files: Vec<PathBuf> = Vec::new();
    records_folder.push("*.json");
    let file_paths = glob(records_folder.as_os_str().to_str().ok_or("err")?);
    for record_file in file_paths? {
        match record_file {
            Ok(record_file) => {
                let duration: Duration;
                let record_date = record_file.metadata()?.modified()?;
                match period.as_str() {
                    "today" => duration = Duration::from_secs(60 * 60 * 24),
                    "week" => duration = Duration::from_secs(60 * 60 * 24 * 7),
                    "month" => duration = Duration::from_secs(60 * 60 * 24 * 30),
                    "all" => {
                        record_files.push(record_file);
                        continue;
                    }
                    "yesterday" => {
                        if record_date > (SystemTime::now() - Duration::from_secs(60 * 60 * 24 * 2)) &&
                            record_date < (SystemTime::now() - Duration::from_secs(60 * 60 * 24))
                        {
                            record_files.push(record_file);
                        }
                        continue;
                    }
                    _ => { duration = Default::default() }
                }

                if record_date > SystemTime::now() - duration {
                    record_files.push(record_file);
                }
            }
            _ => {}
        }
    }

    return Ok(record_files);
}

pub fn get_records(period: String) -> Result<Vec<Record>, Error> {
    let mut count = 1;
    let mut records = Vec::new();
    let record_files = get_record_files(period)?;
    for record_file in record_files {
        let file_name = record_file.display().to_string();
        let reader = BufReader::new(File::open(record_file)?);
        let mut r: Record = match serde_json::from_reader(reader) {
            Ok(r) => r,
            Err(_) => continue // todo log me
        };

        // todo load this value from settings
        if r.final_igt < 30000 { // if its below 30s its an skip
            continue;
        }

        r.key = count;
        r.file = file_name;
        for timeline in &r.timelines {
            match &*timeline.name {
                "enter_nether" => {
                    r.enter_nether = timeline.igt
                }
                "enter_bastion" => {
                    r.enter_bastion = timeline.igt
                }
                "enter_fortress" => {
                    r.enter_fortress = timeline.igt
                }
                "nether_travel" => {
                    r.nether_travel = timeline.igt
                }
                "enter_stronghold" => {
                    r.enter_stronghold = timeline.igt
                }
                "enter_end" => {
                    r.enter_end = timeline.igt
                }
                _ => {}
            }
        }

        records.push(r);
        count += 1;
    }

    return Ok(records);
}
