// Script de teste para envio de email
// Executar com: npx tsx scripts/test-email.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

import nodemailer from 'nodemailer'

console.log('📧 Teste de Configuração de Email')
console.log('=' .repeat(60))

// Verificar variáveis de ambiente
const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'NEXT_PUBLIC_APP_URL']

console.log('\n🔍 Verificando variáveis de ambiente:')
let missingVars = false
for (const varName of requiredVars) {
	const value = process.env[varName]
	if (!value) {
		console.log(`   ❌ ${varName}: não configurado`)
		missingVars = true
	} else {
		// Mascarar senha
		const displayValue = varName.includes('PASS')
			? '****' + value.slice(-4)
			: value
		console.log(`   ✅ ${varName}: ${displayValue}`)
	}
}

if (missingVars) {
	console.log('\n❌ Variáveis faltando. Configure no .env.local')
	process.exit(1)
}

console.log('\n⏳ Testando conexão com servidor SMTP...')

async function testEmail() {
	try {
		// Criar transporter
		const transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: parseInt(process.env.EMAIL_PORT || '587'),
			secure: false, // true para 465, false para outras portas
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
			debug: true, // Log de debug
			logger: true, // Exibir logs
		})

		// Verificar conexão
		console.log('\n🔌 Verificando autenticação SMTP...')
		await transporter.verify()
		console.log('✅ Servidor SMTP autenticado com sucesso!')

		// Enviar email de teste
		console.log('\n📤 Enviando email de teste...')
		const testEmail = process.env.EMAIL_USER

		const info = await transporter.sendMail({
			from: process.env.EMAIL_FROM,
			to: testEmail,
			subject: '✅ Teste de Email - IBS London System',
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
				</head>
				<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f5;">
					<div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
						<h1 style="color: #2563eb; margin-bottom: 20px;">✅ Teste Bem-Sucedido!</h1>
						<p style="color: #3f3f46; line-height: 1.6;">
							Se você está vendo este email, significa que o sistema de envio de emails está funcionando corretamente!
						</p>
						<p style="color: #71717a; font-size: 14px; margin-top: 20px;">
							Data/Hora: ${new Date().toLocaleString('pt-BR')}
						</p>
						<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
							<p style="color: #a1a1aa; font-size: 12px; margin: 0;">
								IBS London 2026 - Classmate Registration System
							</p>
						</div>
					</div>
				</body>
				</html>
			`,
		})

		console.log('\n✅ Email enviado com sucesso!')
		console.log(`   📬 Message ID: ${info.messageId}`)
		console.log(`   📧 Para: ${testEmail}`)
		console.log(`   ✉️  Resposta: ${info.response}`)

		console.log('\n💡 Dicas:')
		console.log('   • Verifique sua caixa de entrada em:', testEmail)
		console.log('   • Verifique também a pasta de SPAM')
		console.log('   • Se estiver usando Gmail com 2FA, certifique-se de usar uma senha de app')

	} catch (error) {
		console.error('\n❌ Erro ao enviar email:')

		if (error instanceof Error) {
			console.error(`   ${error.message}`)

			console.log('\n💡 Possíveis causas:')

			if (error.message.includes('Invalid login')) {
				console.error('   ❌ Credenciais inválidas')
				console.error('      • Verifique EMAIL_USER e EMAIL_PASS')
				console.error('      • Se usar Gmail, precisa de "Senha de App" (não sua senha normal)')
				console.error('      • Ative 2FA no Gmail e gere uma senha de app em: https://myaccount.google.com/apppasswords')
			}

			if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
				console.error('   ❌ Não foi possível conectar ao servidor')
				console.error('      • Verifique EMAIL_HOST e EMAIL_PORT')
				console.error('      • Verifique sua conexão com a internet')
				console.error('      • Firewall pode estar bloqueando')
			}

			if (error.message.includes('self signed certificate')) {
				console.error('   ❌ Problema com certificado SSL')
				console.error('      • Tente adicionar: rejectUnauthorized: false (apenas para desenvolvimento)')
			}
		}

		process.exit(1)
	}
}

testEmail()
