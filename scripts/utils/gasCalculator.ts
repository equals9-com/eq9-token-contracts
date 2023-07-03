import { BigNumber } from "ethers";
// import axios from "axios";
import { ethers } from "hardhat";

export class PolygonGasCalculatorService {
  public gasStationUrl = "https://gasstation.polygon.technology/";

  /**
   *
   * @returns maxFeePerGas and maxPriorityFeePerGas BigNumbers from ethers package
   */
  async calcGas() {
    let maxFeePerGas = BigNumber.from("40000000000"); // fallback to 40 gwei
    let maxPriorityFeePerGas = BigNumber.from("40000000000"); // fallback to 40 gwei
    try {
      const res = await ethers.provider.getFeeData();

      if (res.maxFeePerGas && res.maxPriorityFeePerGas) {
        maxFeePerGas = res.maxFeePerGas;
        maxPriorityFeePerGas = res.maxPriorityFeePerGas;
      }
    } catch (e) {
      console.error(e);
    }

    return { maxFeePerGas, maxPriorityFeePerGas };
  }
}
