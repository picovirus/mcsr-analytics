#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod speedrunigt;

use crate::commands::*;
use log::error;
use tauri::AppHandle;
use tauri_plugin_cli::CliExt;
use tauri_plugin_log::fern::colors::ColoredLevelConfig;
use tauri_plugin_log::{Target, TargetKind};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().targets([
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::LogDir { file_name: Some("{configDir}".to_string()) }),
        ]).with_colors(ColoredLevelConfig::default()).build())
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            // Default to GUI if the app was opened with no CLI args.
            if std::env::args_os().count() <= 1 {
                return Ok(());
            }

            // Else, we start in CLI mode and parse the given parameters
            let cli_matches = match app.cli().matches() {
                Ok(matches) => matches,
                Err(err) => {
                    error!("{}", err);
                    app.handle().exit(1);
                    return Ok(());
                }
            };

            cli_matches.args.iter().for_each(|(key, data)| {
                println!("{}: {:?}", key, data);
                if data.occurrences > 0 || key.as_str() == "help" || key.as_str() == "version" {
                    // Define all CLI commands/arguments here and in the tauri.conf.json file
                    // WARNING: If the command is not defined in the tauri.conf.json file, it can't be used here
                    match key.as_str() {
                        "records" => cli_print(app.handle(), data.value.as_str()),
                        "help" => cli_print(app.handle(), data.value.as_str()),
                        "version" => cli_print(app.handle(), data.value.as_str()),
                        _ => {
                            println!("Command {} not found! Use \"help\" for the list of available commands.", key.as_str());
                            app.handle().exit(2);
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![update_records])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// A small helper function that prints the data of a CLI argument
// Sometimes the data is not formatted correctly, so we need to unescape it
fn cli_print(app: &AppHandle, data: Option<&str>) {
    if let Some(json_str) = data {
        let unescaped_str = json_str.replace("\\n", "\n").replace("\\t", "\t");
        println!("{}", unescaped_str);
        app.exit(0);
    } else {
        // Handle the case where data.value is not a string
        error!("data.value is not a string");
        app.exit(1);
    }
}
