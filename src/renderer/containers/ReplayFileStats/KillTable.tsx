import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import {
  StatsType,
  Frames,
  animations as animationUtils,
  moves as moveUtils,
  StockType,
} from "@slippi/slippi-js";
import { FileResult } from "../../../common/replayBrowser/types";
import React from "react";
import { convertFrameCountToDurationString } from "../../../common/time";
import _ from "lodash";
import * as T from "./TableStyles";
import { extractPlayerNames } from "common/matchNames";
import { getCharacterIcon } from "@/lib/utils";

const columnCount = 5;
export interface KillTableProps {
  file: FileResult;
  stats: StatsType;
  playerIndex: number;
}

export const KillTable: React.FC<KillTableProps> = ({
  file,
  stats,
  playerIndex,
}) => {
  const player = file.settings.players[playerIndex];
  const names = extractPlayerNames(playerIndex, file.settings, file.metadata);
  const playerDisplay = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src={getCharacterIcon(
          player.characterId ?? 0,
          player.characterColor ?? 0
        )}
        height={24}
        width={24}
        style={{
          marginRight: 10,
        }}
      />
      <div style={{ fontWeight: 500 }}>
        {names.name ? names.name : "Player " + (playerIndex + 1)}
      </div>
    </div>
  );
  const generateStockRow = (stock: StockType) => {
    let start = convertFrameCountToDurationString(stock.startFrame);
    let end = "–";

    let killedBy = <span>–</span>;
    let killedDirection = <span>–</span>;

    const percent = `${Math.trunc(stock.currentPercent)}%`;

    const isFirstFrame = stock.startFrame === Frames.FIRST;
    if (isFirstFrame) {
      // start = <span className={styles['secondary-text']}>–</span>;
      start = "–";
    }

    if (stock.endFrame) {
      end = convertFrameCountToDurationString(stock.endFrame);

      killedBy = renderKilledBy(stock);
      killedDirection = (
        <span style={{ color: "#2ECC40", fontSize: 24 }}>
          {renderKilledDirection(stock)}
        </span>
      );
    }

    return (
      <T.TableRow key={`${stock.playerIndex}-stock-${stock.startFrame}`}>
        <T.TableCell>{start}</T.TableCell>
        <T.TableCell>{end}</T.TableCell>
        <T.TableCell>{killedBy}</T.TableCell>
        <T.TableCell>{killedDirection}</T.TableCell>
        <T.TableCell>{percent}</T.TableCell>
      </T.TableRow>
    );
  };

  const renderKilledBy = (stock: StockType) => {
    // Here we are going to grab the opponent's punishes and see if one of them was
    // responsible for ending this stock, if so show the kill move, otherwise assume SD
    const punishes = _.get(stats, "conversions") || [];
    const punishesByPlayer = _.groupBy(punishes, "playerIndex");
    const playerPunishes = punishesByPlayer[playerIndex] || [];

    // Only get punishes that killed
    const killingPunishes = _.filter(playerPunishes, "didKill");
    const killingPunishesByEndFrame = _.keyBy(killingPunishes, "endFrame");
    const punishThatEndedStock = stock.endFrame
      ? killingPunishesByEndFrame[stock.endFrame]
      : null;

    if (!punishThatEndedStock) {
      // return <span className={styles['secondary-text']}>Self Destruct</span>;
      return <span>Self Destruct</span>;
    }

    const lastMove = _.last(punishThatEndedStock.moves);
    if (!lastMove) {
      return <span>Grab Release</span>;
    }
    return <span>{moveUtils.getMoveName(lastMove.moveId)}</span>;
  };

  const renderKilledDirection = (stock: StockType) => {
    if (stock.deathAnimation === null || stock.deathAnimation === undefined) {
      return undefined;
    }

    const killedDirection = animationUtils.getDeathDirection(
      stock.deathAnimation
    );
    switch (killedDirection) {
      case "up":
        return <ArrowUpwardIcon fontSize="inherit" />;
      case "down":
        return <ArrowDownwardIcon fontSize="inherit" />;
      case "left":
        return <ArrowBackIcon fontSize="inherit" />;
      case "right":
        return <ArrowForwardIcon fontSize="inherit" />;
    }
  };

  const renderHeaderPlayer = () => {
    return (
      <T.TableRow>
        <T.TableHeaderCell colSpan={columnCount}>
          {playerDisplay}
        </T.TableHeaderCell>
      </T.TableRow>
    );
  };

  const renderHeaderColumns = () => {
    return (
      <T.TableRow>
        <T.TableSubHeaderCell>Start</T.TableSubHeaderCell>
        <T.TableSubHeaderCell>End</T.TableSubHeaderCell>
        <T.TableSubHeaderCell>Kill Move</T.TableSubHeaderCell>
        <T.TableSubHeaderCell>Direction</T.TableSubHeaderCell>
        <T.TableSubHeaderCell>Percent</T.TableSubHeaderCell>
      </T.TableRow>
    );
  };

  const renderStocksRows = () => {
    const stocks = _.get(stats, "stocks") || [];
    const stocksByOpponent = _.groupBy(stocks, "opponentIndex");
    const opponentStocks = stocksByOpponent[playerIndex] || [];

    return opponentStocks.map(generateStockRow);
  };

  return (
    <T.Table>
      <thead>
        {renderHeaderPlayer()}
        {renderHeaderColumns()}
      </thead>
      <tbody>{renderStocksRows()}</tbody>
    </T.Table>
  );
};