/**
 * Liscia la geometria del GLB dell'auto (ricostruzione Meshy): le "grinze"
 * dei pannelli producono riflessi frastagliati che tradiscono il modello AI.
 * Taubin smoothing (λ/μ: attenua le alte frequenze SENZA restringere il
 * volume) sul grafo dei vertici raggruppati PER POSIZIONE (i vertici sono
 * splittati sulle cuciture UV: muoverli in modo indipendente aprirebbe crepe),
 * poi normali smooth ricalcolate sugli stessi gruppi.
 *
 * Uso: node tools/smooth-glb.mjs <in.glb> <out.glb> [iterazioni=5]
 */
import { NodeIO } from "@gltf-transform/core";

const [inPath, outPath, itersArg] = process.argv.slice(2);
if (!inPath || !outPath) {
  console.error("uso: node tools/smooth-glb.mjs <in.glb> <out.glb> [iter]");
  process.exit(1);
}
const ITER = Number(itersArg ?? 5);
const LAMBDA = 0.5;
const MU = -0.53;

const io = new NodeIO();
const doc = await io.read(inPath);

for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const posAcc = prim.getAttribute("POSITION");
    const idxAcc = prim.getIndices();
    if (!posAcc || !idxAcc) continue;

    const pos = posAcc.getArray(); // Float32Array, xyz per vertice
    const idx = idxAcc.getArray();
    const vCount = posAcc.getCount();

    // 1. Gruppi posizionali: vertici coincidenti (split UV) → stesso nodo.
    const keyOf = (i) =>
      `${pos[i * 3].toFixed(5)},${pos[i * 3 + 1].toFixed(5)},${pos[i * 3 + 2].toFixed(5)}`;
    const groupOf = new Int32Array(vCount);
    const groups = [];
    {
      const byKey = new Map();
      for (let i = 0; i < vCount; i++) {
        const k = keyOf(i);
        let g = byKey.get(k);
        if (g === undefined) {
          g = groups.length;
          byKey.set(k, g);
          groups.push([]);
        }
        groupOf[i] = g;
        groups[g].push(i);
      }
    }

    // 2. Adiacenza tra gruppi (dagli spigoli dei triangoli).
    const nbr = Array.from({ length: groups.length }, () => new Set());
    for (let t = 0; t < idx.length; t += 3) {
      const a = groupOf[idx[t]];
      const b = groupOf[idx[t + 1]];
      const c = groupOf[idx[t + 2]];
      if (a !== b) {
        nbr[a].add(b);
        nbr[b].add(a);
      }
      if (b !== c) {
        nbr[b].add(c);
        nbr[c].add(b);
      }
      if (a !== c) {
        nbr[a].add(c);
        nbr[c].add(a);
      }
    }

    // Posizione per gruppo (dal primo vertice del gruppo).
    let gp = new Float64Array(groups.length * 3);
    for (let g = 0; g < groups.length; g++) {
      const i = groups[g][0];
      gp[g * 3] = pos[i * 3];
      gp[g * 3 + 1] = pos[i * 3 + 1];
      gp[g * 3 + 2] = pos[i * 3 + 2];
    }

    // 3. Taubin: passo λ (shrink) + passo μ (inflate) per iterazione.
    const step = (src, factor) => {
      const dst = new Float64Array(src.length);
      for (let g = 0; g < groups.length; g++) {
        const ns = nbr[g];
        if (ns.size === 0) {
          dst[g * 3] = src[g * 3];
          dst[g * 3 + 1] = src[g * 3 + 1];
          dst[g * 3 + 2] = src[g * 3 + 2];
          continue;
        }
        let mx = 0,
          my = 0,
          mz = 0;
        for (const n of ns) {
          mx += src[n * 3];
          my += src[n * 3 + 1];
          mz += src[n * 3 + 2];
        }
        mx /= ns.size;
        my /= ns.size;
        mz /= ns.size;
        dst[g * 3] = src[g * 3] + factor * (mx - src[g * 3]);
        dst[g * 3 + 1] = src[g * 3 + 1] + factor * (my - src[g * 3 + 1]);
        dst[g * 3 + 2] = src[g * 3 + 2] + factor * (mz - src[g * 3 + 2]);
      }
      return dst;
    };
    for (let k = 0; k < ITER; k++) {
      gp = step(gp, LAMBDA);
      gp = step(gp, MU);
    }

    // 4. Riscrivi le posizioni (stesso valore per tutti i vertici del gruppo).
    const newPos = new Float32Array(pos.length);
    for (let g = 0; g < groups.length; g++) {
      for (const i of groups[g]) {
        newPos[i * 3] = gp[g * 3];
        newPos[i * 3 + 1] = gp[g * 3 + 1];
        newPos[i * 3 + 2] = gp[g * 3 + 2];
      }
    }
    posAcc.setArray(newPos);

    // 5. Normali smooth per gruppo: somma delle normali di faccia pesate
    //    dall'area (cross product non normalizzato), poi normalizza.
    const nAcc = prim.getAttribute("NORMAL");
    if (nAcc) {
      const gn = new Float64Array(groups.length * 3);
      for (let t = 0; t < idx.length; t += 3) {
        const i0 = idx[t],
          i1 = idx[t + 1],
          i2 = idx[t + 2];
        const ax = newPos[i1 * 3] - newPos[i0 * 3],
          ay = newPos[i1 * 3 + 1] - newPos[i0 * 3 + 1],
          az = newPos[i1 * 3 + 2] - newPos[i0 * 3 + 2];
        const bx = newPos[i2 * 3] - newPos[i0 * 3],
          by = newPos[i2 * 3 + 1] - newPos[i0 * 3 + 1],
          bz = newPos[i2 * 3 + 2] - newPos[i0 * 3 + 2];
        const nx = ay * bz - az * by,
          ny = az * bx - ax * bz,
          nz = ax * by - ay * bx;
        for (const i of [i0, i1, i2]) {
          const g = groupOf[i];
          gn[g * 3] += nx;
          gn[g * 3 + 1] += ny;
          gn[g * 3 + 2] += nz;
        }
      }
      const newN = new Float32Array(vCount * 3);
      for (let g = 0; g < groups.length; g++) {
        let x = gn[g * 3],
          y = gn[g * 3 + 1],
          z = gn[g * 3 + 2];
        const l = Math.hypot(x, y, z) || 1;
        x /= l;
        y /= l;
        z /= l;
        for (const i of groups[g]) {
          newN[i * 3] = x;
          newN[i * 3 + 1] = y;
          newN[i * 3 + 2] = z;
        }
      }
      nAcc.setArray(newN);
    }

    console.log(
      `mesh "${mesh.getName()}": ${vCount} vertici, ${groups.length} gruppi, ${ITER} iter Taubin`,
    );
  }
}

await io.write(outPath, doc);
console.log(`scritto ${outPath}`);
