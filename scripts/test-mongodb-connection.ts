// Script de diagnóstico para testar a conexão MongoDB
// Executar com: npx tsx scripts/test-mongodb-connection.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

console.log('🔍 Diagnóstico de Conexão MongoDB')
console.log('=' .repeat(60))

if (!MONGODB_URI) {
	console.error('❌ MONGODB_URI não encontrado no .env.local')
	process.exit(1)
}

// Mascarar a senha na exibição
const maskedUri = MONGODB_URI.replace(
	/mongodb\+srv:\/\/([^:]+):([^@]+)@/,
	'mongodb+srv://$1:****@'
)
console.log(`📍 URI: ${maskedUri}`)
console.log('')

async function testConnection() {
	const startTime = Date.now()

	try {
		console.log('⏳ Tentando conectar...')

		// Configurações recomendadas para MongoDB Atlas
		await mongoose.connect(MONGODB_URI!, {
			serverSelectionTimeoutMS: 10000, // 10 segundos timeout
			socketTimeoutMS: 45000,
		})

		const elapsed = Date.now() - startTime

		console.log(`✅ Conexão estabelecida com sucesso! (${elapsed}ms)`)
		console.log('')
		console.log('📊 Informações do Banco:')
		console.log(`   - Nome: ${mongoose.connection.db?.databaseName}`)
		console.log(`   - Estado: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`)
		console.log(`   - Host: ${mongoose.connection.host}`)

		// Listar coleções
		if (mongoose.connection.db) {
			const collections = await mongoose.connection.db.collections()
			console.log(`   - Coleções (${collections.length}):`)
			if (collections.length > 0) {
				for (const col of collections) {
					const count = await col.countDocuments()
					console.log(`     • ${col.collectionName}: ${count} documentos`)
				}
			} else {
				console.log('     (nenhuma coleção encontrada)')
			}
		}

		await mongoose.disconnect()
		console.log('\n✅ Desconectado com sucesso')

	} catch (error) {
		const elapsed = Date.now() - startTime
		console.error(`\n❌ Falha na conexão (${elapsed}ms)`)
		console.error('')

		if (error instanceof Error) {
			console.error('📛 Erro:', error.message)

			// Diagnóstico específico
			console.error('\n💡 Possíveis causas:')

			if (error.message.includes('ENOTFOUND')) {
				console.error('   ❌ DNS não resolvido - verifique o nome do cluster')
			}

			if (error.message.includes('authentication failed')) {
				console.error('   ❌ Falha de autenticação - verifique usuário/senha')
				console.error('      • Usuário: correto?')
				console.error('      • Senha: sem caracteres especiais não codificados?')
			}

			if (error.message.includes('ETIMEDOUT') || error.message.includes('connection timed out')) {
				console.error('   ❌ Timeout de conexão')
				console.error('      • Seu IP está na whitelist do MongoDB Atlas?')
				console.error('      • Firewall bloqueando a porta 27017?')
			}

			if (error.message.includes('SSL') || error.message.includes('TLS')) {
				console.error('   ❌ Erro SSL/TLS')
				console.error('      • Versão do Node.js compatível? (use v18+)')
				console.error('      • Certificados do sistema atualizados?')
				console.error('      • Tente adicionar: &tlsAllowInvalidCertificates=true (apenas para teste)')
			}

			if (error.message.includes('MongoServerSelectionError')) {
				console.error('   ❌ Erro de seleção de servidor')
				console.error('      • IP não está na whitelist do MongoDB Atlas')
				console.error('      • Cluster está pausado ou indisponível')
			}

			console.error('\n📚 Passos para resolver:')
			console.error('   1. Acesse https://cloud.mongodb.com')
			console.error('   2. Vá em Security → Network Access')
			console.error('   3. Adicione seu IP ou use 0.0.0.0/0 (todos)')
			console.error('   4. Vá em Database Access e verifique usuário/senha')
			console.error('   5. Verifique se o cluster está ativo (não pausado)')
		}

		process.exit(1)
	}
}

testConnection()
