use std::collections::HashMap;
use std::fs::File;
use std::io::BufReader;
use std::path::PathBuf;
use dirs::home_dir;
use glob::glob;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Record {
    #[serde(default)]
    key: i32,
    mc_version: String,
    speedrunigt_version: String,
    category: String,
    run_type: String,
    is_completed: bool,
    is_coop: bool,
    is_hardcore: bool,
    world_name: String,
    #[serde(default)]
    is_cheat_allowed: bool,
    #[serde(default)]
    default_gamemode: i8,
    date: i64,
    retimed_igt: i32,
    final_igt: i32,
    stats_igt: i32,
    final_rta: i32,
    timelines: Vec<Timeline>,
    advancements: HashMap<String, Advancement>,

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

#[derive(Serialize, Deserialize)]
struct Advancement {
    complete: bool,
    is_advancement: bool,
    criteria: HashMap<String, Timer>,
    igt: i32,
    rta: i32,
}

#[derive(Serialize, Deserialize)]
struct Timer {
    igt: i32,
    rta: i32,
}


fn get_record_files() -> Vec<PathBuf> {
    let mut record_files = Vec::new();
    let home_dir = home_dir();
    match home_dir {
        Some(mut records_path) => {
            records_path.push("speedrunigt/records/*.json");
            let record_path_str = records_path.as_os_str().to_str().unwrap();
            let records_path = glob(record_path_str);
            match records_path {
                Ok(records_path) => {
                    for record_file in records_path {
                        match record_file {
                            Ok(record_file) => {
                                record_files.push(record_file)
                            }
                            _ => {}
                        }
                    }
                }
                _ => {} // pattern error
            }
        }
        None => {}
    }
    return record_files;
}

pub fn get_records() -> Vec<Record> {
    let mut records = Vec::new();
    let record_files = crate::speedrunigt::get_record_files();
    let mut count = 1;
    for record_file in record_files {
        // println!("test {}", record_file.clone().into_os_string().into_string().unwrap());
        let reader = BufReader::new(File::open(record_file).unwrap());
        let mut r: crate::speedrunigt::Record = match serde_json::from_reader(reader) {
            Ok(r) => r,
            Err(_) => continue
        };

        if r.final_igt < 30000 { // if its below 30s its an skip
            continue;
        }

        for timeline in &r.timelines{
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

        r.key = count;
        records.push(r);

        count += 1;
    }
    return records;
}
